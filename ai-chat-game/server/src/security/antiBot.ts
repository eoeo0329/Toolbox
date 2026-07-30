/**
 * 防机器人系统
 * - IP 频率限制 / 请求限流
 * - 设备指纹识别
 * - 异常操作检测
 * - 防自动化脚本
 * - 验证码触发机制
 * - Token 有效期管理
 * - 注册行为检测
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { securityStore } from './riskStore';
import type { AuthenticatedRequest, SecurityResult } from './types';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '30');
const LOGIN_MAX = parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5');

// =================== IP 提取 ===================
export function getClientIP(req: AuthenticatedRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

// =================== 请求限流中间件 ===================
export function rateLimiter(max: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
  return (req: AuthenticatedRequest, res: any, next: any) => {
    const ip = getClientIP(req);
    const route = req.path || 'global';

    // IP 黑名单检查
    if (securityStore.isIPBanned(ip)) {
      return res.status(403).json({ error: 'IP 已被封禁', code: 'IP_BANNED' });
    }

    const entry = securityStore.getRateLimit(ip, route);
    const now = Date.now();

    if (entry) {
      // 窗口内
      if (now - entry.first < windowMs) {
        entry.count += 1;
        entry.last = now;

        // 超过限流 -> 触发验证码或封禁
        if (entry.count > max) {
          // 严重超限 -> 临时封禁 10 分钟
          if (entry.count > max * 3) {
            entry.blocked = true;
            entry.blockUntil = now + 10 * 60 * 1000;
            securityStore.banIP(ip);
            return res.status(429).json({
              error: '请求频率异常，IP 已被临时封禁 10 分钟',
              code: 'RATE_LIMIT_BANNED',
              retryAfter: 600,
            });
          }
          // 超限 -> 要求验证码
          securityStore.setRateLimit(ip, route, entry);
          return res.status(429).json({
            error: '请求过于频繁，请完成验证码验证',
            code: 'RATE_LIMIT_CHALLENGE',
            requireCaptcha: true,
            retryAfter: Math.ceil((windowMs - (now - entry.first)) / 1000),
          });
        }
        securityStore.setRateLimit(ip, route, entry);
      } else {
        // 窗口过期，重置
        securityStore.setRateLimit(ip, route, { count: 1, first: now, last: now, blocked: false });
      }
    } else {
      securityStore.setRateLimit(ip, route, { count: 1, first: now, last: now, blocked: false });
    }

    next();
  };
}

// =================== 登录尝试限制 ===================
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginAttempts(ip: string): SecurityResult {
  const entry = loginAttempts.get(ip);
  const now = Date.now();

  if (entry && entry.lockedUntil > now) {
    const remaining = Math.ceil((entry.lockedUntil - now) / 1000 / 60);
    return {
      passed: false,
      reason: `登录失败次数过多，账户已锁定 ${remaining} 分钟`,
      action: 'block',
    };
  }

  return { passed: true };
}

export function recordLoginFailure(ip: string) {
  const entry = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  entry.count += 1;

  if (entry.count >= LOGIN_MAX) {
    entry.lockedUntil = Date.now() + 30 * 60 * 1000; // 锁定 30 分钟
    securityStore.banIP(ip);
  }

  loginAttempts.set(ip, entry);
}

export function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// =================== 设备指纹识别 ===================
export function generateDeviceFingerprint(req: AuthenticatedRequest): string {
  const ip = getClientIP(req);
  const ua = req.headers['user-agent'] || '';
  const lang = req.headers['accept-language'] || '';
  const accept = req.headers['accept'] || '';
  const encoding = req.headers['accept-encoding'] || '';

  const raw = [ip, ua, lang, accept, encoding].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

export function registerDevice(req: AuthenticatedRequest, userId?: string): string {
  const deviceId = generateDeviceFingerprint(req);
  const now = Date.now();
  const existing = securityStore.getDevice(deviceId);

  if (existing) {
    // 设备已封禁
    if (securityStore.isDeviceBanned(deviceId)) {
      return deviceId;
    }
    securityStore.setDevice({
      ...existing,
      userId: userId || existing.userId,
      lastSeen: now,
      requestCount: existing.requestCount + 1,
    });
  } else {
    securityStore.setDevice({
      deviceId,
      userId,
      userAgent: req.headers['user-agent'] || '',
      acceptLanguage: req.headers['accept-language'] || '',
      firstSeen: now,
      lastSeen: now,
      requestCount: 1,
      riskScore: 0,
      banned: false,
    });
  }

  return deviceId;
}

export function isDeviceBanned(deviceId: string): boolean {
  return securityStore.isDeviceBanned(deviceId);
}

// =================== 异常操作检测 ===================
export function detectAnomalies(req: AuthenticatedRequest): SecurityResult {
  const violations: string[] = [];
  const ua = (req.headers['user-agent'] || '').toLowerCase();

  // 1. 检测自动化脚本 User-Agent
  const botPatterns = [
    'bot', 'crawler', 'spider', 'curl', 'wget', 'python', 'scrapy',
    'selenium', 'puppeteer', 'headless', 'phantom', 'postman',
    'httpclient', 'java/', 'okhttp', 'go-http-client', 'axios',
  ];
  for (const pattern of botPatterns) {
    if (ua.includes(pattern)) {
      violations.push(`检测到自动化工具: ${pattern}`);
    }
  }

  // 2. 检测无 User-Agent
  if (!req.headers['user-agent']) {
    violations.push('缺少 User-Agent，疑似自动化请求');
  }

  // 3. 检测异常请求头
  if (!req.headers['accept'] || !req.headers['accept-language']) {
    violations.push('缺少标准请求头，疑似自动化请求');
  }

  // 4. 检测请求体过大（可能是攻击）
  const contentLength = parseInt(req.headers['content-length'] as string) || 0;
  if (contentLength > 1024 * 1024) {
    violations.push('请求体过大，可能为攻击');
  }

  if (violations.length > 0) {
    return {
      passed: false,
      reason: violations.join('; '),
      action: violations.length >= 2 ? 'block' : 'challenge',
      violations,
    };
  }

  return { passed: true };
}

// =================== 防自动化脚本：行为节奏检测 ===================
const requestTimestamps = new Map<string, number[]>();

export function detectBotBehavior(deviceId: string): SecurityResult {
  const now = Date.now();
  const windowMs = 10000; // 10 秒窗口
  const timestamps = requestTimestamps.get(deviceId) || [];

  // 过滤过期时间戳
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  requestTimestamps.set(deviceId, recent);

  // 10 秒内超过 15 次请求 -> 疑似机器人
  if (recent.length > 15) {
    // 计算请求间隔的标准差，机器人通常间隔非常均匀
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // 标准差很小 = 间隔极度均匀 = 高概率是脚本
    if (stdDev < 50) {
      return {
        passed: false,
        reason: `请求间隔标准差 ${stdDev.toFixed(0)}ms，高度疑似自动化脚本`,
        action: 'block',
        violations: ['bot_behavior_uniform'],
      };
    }

    return {
      passed: false,
      reason: `10秒内 ${recent.length} 次请求，频率异常`,
      action: 'challenge',
      violations: ['high_frequency'],
    };
  }

  return { passed: true };
}

// =================== 验证码机制 ===================
// 生成图形验证码挑战
export function generateCaptchaChallenge(): { captchaId: string; question: string; answer: string } {
  const captchaId = uuidv4();
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = ['+', '-', '*'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;

  return {
    captchaId,
    question: `${a} ${op} ${b} = ?`,
    answer: String(answer),
  };
}

// 验证验证码（存储在调用方，这里只做校验逻辑）
const captchaStore = new Map<string, { answer: string; expires: number }>();

export function issueCaptcha(): { captchaId: string; question: string } {
  const challenge = generateCaptchaChallenge();
  captchaStore.set(challenge.captchaId, {
    answer: challenge.answer,
    expires: Date.now() + 5 * 60 * 1000, // 5 分钟有效
  });
  return { captchaId: challenge.captchaId, question: challenge.question };
}

export function verifyCaptcha(captchaId: string, answer: string): boolean {
  const stored = captchaStore.get(captchaId);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    captchaStore.delete(captchaId);
    return false;
  }
  const ok = stored.answer === answer.trim();
  if (ok) captchaStore.delete(captchaId);
  return ok;
}

// =================== Token 管理 ===================
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const TOKEN_TTL = '24h'; // Token 有效期 24 小时

export function generateToken(userId: string, deviceId: string): string {
  return jwt.sign({ userId, deviceId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): { userId: string; deviceId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; deviceId: string };
    return decoded;
  } catch {
    return null;
  }
}

// =================== JWT 认证中间件 ===================
export function authMiddleware(req: AuthenticatedRequest, res: any, next: any) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: '未提供认证 Token', code: 'NO_TOKEN' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token 无效或已过期', code: 'INVALID_TOKEN' });
  }

  // 检查用户是否被封禁
  if (securityStore.isUserBanned(decoded.userId)) {
    const profile = securityStore.getUserProfile(decoded.userId);
    return res.status(403).json({
      error: '账户已被封禁',
      reason: profile.banReason,
      code: 'USER_BANNED',
    });
  }

  // 检查设备是否被封禁
  if (securityStore.isDeviceBanned(decoded.deviceId)) {
    return res.status(403).json({ error: '设备已被封禁', code: 'DEVICE_BANNED' });
  }

  req.userId = decoded.userId;
  req.deviceId = decoded.deviceId;

  next();
}
