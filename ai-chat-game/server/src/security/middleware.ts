/**
 * Express 安全中间件组合
 * 统一挂载所有安全检测层
 */

import { rateLimiter, detectAnomalies, detectBotBehavior, registerDevice, getClientIP, authMiddleware, issueCaptcha, verifyCaptcha } from './antiBot';
import { processOutgoingMessage, checkAutoBanAfterViolation } from './contentModeration';
import { checkAIInputSafety, reviewAIOutput, SYSTEM_SAFETY_PROMPT } from './aiSafety';
import { reportUser, blockUser, unblockUser, isBlocked, getRiskScore, getRiskLevel, checkAndAutoBan, getSecurityStats, adminBanUser, adminUnbanUser, getBlockedUsers } from './userSafety';
import { encryptData, decryptData } from './dataSecurity';
import type { AuthenticatedRequest } from './types';

// ===== 安全请求日志 =====
export function securityAuditLog(req: AuthenticatedRequest, res: any, next: any) {
  const ip = getClientIP(req);
  const ua = req.headers['user-agent'] || '';
  const method = req.method;
  const path = req.path;

  // 记录设备
  const deviceId = registerDevice(req);

  // 检查设备封禁状态（registerDevice 内部已处理，这里仅日志）
  console.log(`[AUDIT] ${method} ${path} | IP: ${ip} | Device: ${deviceId.substring(0, 8)}... | UA: ${ua.substring(0, 50)}`);

  // 异常操作检测
  const anomaly = detectAnomalies(req);
  if (!anomaly.passed) {
    if (anomaly.action === 'block') {
      return res.status(403).json({
        error: '请求被安全系统拦截',
        reason: anomaly.reason,
        code: 'ANOMALY_BLOCKED',
      });
    }
    // challenge -> 记录但放行，后续可触发验证码
    console.warn(`[SECURITY WARN] ${anomaly.reason} | IP: ${ip}`);
  }

  // 机器人行为检测
  const botCheck = detectBotBehavior(deviceId);
  if (!botCheck.passed) {
    if (botCheck.action === 'block') {
      return res.status(403).json({
        error: '检测到自动化脚本行为',
        reason: botCheck.reason,
        code: 'BOT_BLOCKED',
      });
    }
    // challenge -> 触发验证码
    if (botCheck.action === 'challenge') {
      const captcha = issueCaptcha();
      return res.status(429).json({
        error: '需要验证码验证',
        reason: botCheck.reason,
        code: 'CAPTCHA_REQUIRED',
        captchaId: captcha.captchaId,
        captchaQuestion: captcha.question,
      });
    }
  }

  next();
}

// ===== 导出所有安全工具供路由使用 =====
export {
  // 防机器人
  rateLimiter, detectAnomalies, detectBotBehavior, registerDevice,
  getClientIP, authMiddleware, issueCaptcha, verifyCaptcha,
  // 内容审核
  processOutgoingMessage, checkAutoBanAfterViolation,
  // AI 安全
  checkAIInputSafety, reviewAIOutput, SYSTEM_SAFETY_PROMPT,
  // 用户安全
  reportUser, blockUser, unblockUser, isBlocked, getRiskScore, getRiskLevel,
  checkAndAutoBan, getSecurityStats, adminBanUser, adminUnbanUser, getBlockedUsers,
  // 数据安全
  encryptData, decryptData,
};
