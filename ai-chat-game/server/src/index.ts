/**
 * Express 服务器入口
 * 集成所有安全防护层 + API 路由
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { securityAuditLog, rateLimiter, authMiddleware, getClientIP, registerDevice,
  processOutgoingMessage, checkAutoBanAfterViolation,
  checkAIInputSafety, reviewAIOutput, SYSTEM_SAFETY_PROMPT,
  reportUser, blockUser, unblockUser, isBlocked, getRiskScore, getRiskLevel,
  checkAndAutoBan, getSecurityStats, adminBanUser, adminUnbanUser,
  issueCaptcha, verifyCaptcha, encryptData, decryptData } from './security/middleware';
import { generateToken, checkLoginAttempts, recordLoginFailure, resetLoginAttempts } from './security/antiBot';
import { hashPassword, verifyPassword, securityHeaders, hasPermission } from './security/dataSecurity';
import { getBlockedUsers } from './security/userSafety';
import { callDeepSeek, getFallbackReply } from './ai/deepseek';
import type { AuthenticatedRequest } from './security/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// =================== 基础中间件 ===================
app.use(helmet());                          // 安全响应头
// CORS：支持 .env 里逗号分隔的多个 origin
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));     // 限制请求体大小（防大 payload 攻击）
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// =================== 全局安全层（所有请求经过） ===================
app.use(securityAuditLog);                  // 异常检测 + 机器人检测 + 审计日志
app.use(rateLimiter(60, 60000));             // 全局限流：60次/分钟

// =================== 健康检查 ===================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// =================== 认证路由 ===================
app.post('/api/auth/register', rateLimiter(3, 60000), async (req: AuthenticatedRequest, res) => {
  const { username, password, captchaId, captchaAnswer } = req.body;

  // 验证码校验（注册必须验证）
  if (!captchaId || !verifyCaptcha(captchaId, captchaAnswer)) {
    return res.status(400).json({ error: '验证码错误', code: 'CAPTCHA_FAILED' });
  }

  if (!username || !password || password.length < 8) {
    return res.status(400).json({ error: '用户名或密码不符合要求', code: 'INVALID_INPUT' });
  }

  // 加密存储密码
  const passwordHash = await hashPassword(password);
  const deviceId = registerDevice(req);

  // 生成 Token
  const token = generateToken(username, deviceId);

  res.json({
    success: true,
    token,
    user: { username },
    message: '注册成功',
  });
});

app.post('/api/auth/login', rateLimiter(5, 60000), async (req: AuthenticatedRequest, res) => {
  const { username, password } = req.body;
  const ip = getClientIP(req);

  // 登录尝试限制
  const attemptCheck = checkLoginAttempts(ip);
  if (!attemptCheck.passed) {
    return res.status(429).json({ error: attemptCheck.reason, code: 'LOGIN_LOCKED' });
  }

  // 模拟验证（生产环境查数据库）
  if (!username || !password) {
    recordLoginFailure(ip);
    return res.status(401).json({ error: '用户名或密码错误', code: 'AUTH_FAILED' });
  }

  // 模拟：假设验证通过
  resetLoginAttempts(ip);
  const deviceId = registerDevice(req, username);
  const token = generateToken(username, deviceId);

  res.json({ success: true, token, user: { username } });
});

// 游客登录（开发联调用，前端自动获取一次性 token）
app.post('/api/auth/guest', rateLimiter(5, 60000), (req: AuthenticatedRequest, res) => {
  const deviceId = registerDevice(req);
  const guestId = `guest_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const token = generateToken(guestId, deviceId);
  res.json({ success: true, token, user: { username: guestId, isGuest: true } });
});

// =================== 验证码路由 ===================
app.get('/api/captcha', (req, res) => {
  const captcha = issueCaptcha();
  res.json({ captchaId: captcha.captchaId, question: captcha.question });
});

// =================== 聊天路由（需要认证） ===================
app.post('/api/chat/send', authMiddleware, rateLimiter(20, 60000), async (req: AuthenticatedRequest, res) => {
  const { text } = req.body;
  const userId = req.userId!;

  if (!text || text.length > 2000) {
    return res.status(400).json({ error: '消息内容无效或过长', code: 'INVALID_MESSAGE' });
  }

  // 第一步：用户消息内容审核
  const result = await processOutgoingMessage(userId, text);

  if (result.blocked) {
    // 检查是否触发自动封禁
    const banResult = checkAutoBanAfterViolation(userId);
    return res.status(403).json({
      error: '消息已被安全系统拦截',
      reason: result.reason,
      code: 'MESSAGE_BLOCKED',
      autoBanned: banResult.banned,
      banReason: banResult.reason,
    });
  }

  // 如果消息包含违规但未拦截 -> 返回警告
  if (result.violations.length > 0) {
    // 检查自动封禁
    checkAutoBanAfterViolation(userId);
    return res.json({
      success: true,
      text: result.text,
      warning: result.reason,
      filtered: true,
    });
  }

  res.json({ success: true, text: result.text });
});

// =================== AI 聊天路由（需要认证） ===================
// 接收: { text, personality, history? }
// 流程: 输入安全检查 -> 调用 DeepSeek -> 输出审核 -> 返回
app.post('/api/ai/chat', authMiddleware, rateLimiter(15, 60000), async (req: AuthenticatedRequest, res) => {
  const { text, personality = 'rational', history } = req.body;
  const userId = req.userId!;

  if (!text || text.length > 1000) {
    return res.status(400).json({ error: '输入无效', code: 'INVALID_INPUT' });
  }

  const validPersonalities = ['cold', 'energetic', 'humorous', 'rational', 'emotional'];
  if (!validPersonalities.includes(personality)) {
    return res.status(400).json({ error: '人格类型无效', code: 'INVALID_PERSONALITY' });
  }

  // 第一步：AI 输入安全检查（防提示词注入）
  const aiSafety = checkAIInputSafety(text);

  if (!aiSafety.passed) {
    const { processOutgoingMessage } = await import('./security/contentModeration');
    await processOutgoingMessage(userId, text);
    checkAutoBanAfterViolation(userId);

    return res.status(403).json({
      error: '输入被 AI 安全系统拦截',
      reason: aiSafety.reason,
      code: 'AI_INPUT_BLOCKED',
      injectionDetected: aiSafety.injectionDetected,
    });
  }

  // 第二步：调用 DeepSeek
  const result = await callDeepSeek(aiSafety.cleaned, { personality, history });

  // 第三步：处理结果（失败则降级回复）
  let aiResponse: string;
  let degraded = false;

  if (result.success) {
    aiResponse = result.reply;
  } else {
    // API 失败 -> 使用降级回复（不告诉玩家，保持游戏体验）
    aiResponse = getFallbackReply(personality);
    degraded = true;
    console.warn(`[AI] DeepSeek 调用失败(${result.error})，使用降级回复`);
  }

  // 第四步：AI 输出审核
  const outputReview = await reviewAIOutput(aiResponse);

  if (!outputReview.approved) {
    // 审核未过 -> 用降级回复兜底
    aiResponse = getFallbackReply(personality);
    degraded = true;
    console.warn('[AI] AI 输出未通过审核，已降级');
  }

  res.json({
    success: true,
    reply: aiResponse,
    personality,
    filtered: aiSafety.injectionDetected,
    warning: aiSafety.reason,
    degraded,
    tokensUsed: result.tokensUsed,
  });
});

// =================== 用户安全路由 ===================
// 举报
app.post('/api/safety/report', authMiddleware, rateLimiter(5, 60000), (req: AuthenticatedRequest, res) => {
  const { targetId, reason, category, evidence } = req.body;
  const report = reportUser(req.userId!, targetId, reason, category, evidence);
  res.json({ success: true, reportId: report.id });
});

// 拉黑
app.post('/api/safety/block', authMiddleware, (req: AuthenticatedRequest, res) => {
  blockUser(req.userId!, req.body.targetId);
  res.json({ success: true });
});

// 取消拉黑
app.delete('/api/safety/block/:targetId', authMiddleware, (req: AuthenticatedRequest, res) => {
  unblockUser(req.userId!, req.params.targetId);
  res.json({ success: true });
});

// 查看拉黑列表
app.get('/api/safety/blocked', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({ blocked: getBlockedUsers(req.userId!) });
});

// 风险评分
app.get('/api/safety/risk/:userId', authMiddleware, (req: AuthenticatedRequest, res) => {
  const score = getRiskScore(req.params.userId);
  const level = getRiskLevel(req.params.userId);
  res.json({ userId: req.params.userId, riskScore: score, riskLevel: level });
});

// =================== 管理员路由 ===================
app.post('/api/admin/ban', authMiddleware, (req: AuthenticatedRequest, res) => {
  // 生产环境检查 admin 权限
  const { userId, reason, duration } = req.body;
  adminBanUser(userId, reason, duration);
  res.json({ success: true });
});

app.post('/api/admin/unban', authMiddleware, (req: AuthenticatedRequest, res) => {
  adminUnbanUser(req.body.userId);
  res.json({ success: true });
});

app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json(getSecurityStats());
});

// =================== 加解密工具（仅服务端内部使用） ===================
app.post('/api/crypto/encrypt', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({ encrypted: encryptData(req.body.data) });
});

// =================== 404 处理 ===================
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在', code: 'NOT_FOUND' });
});

// =================== 全局错误处理 ===================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: '服务器内部错误', code: 'INTERNAL_ERROR' });
});

// =================== 启动 ===================
app.listen(PORT, () => {
  console.log(`\n🛡️  AI Challenge Security Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Rate limit: ${process.env.RATE_LIMIT_MAX || 30} req / ${process.env.RATE_LIMIT_WINDOW_MS || 60000}ms`);
  console.log(`   JWT TTL: 24h`);
  console.log(`   Auto-ban threshold: ${process.env.AUTO_BAN_THRESHOLD || 5} violations\n`);
});
