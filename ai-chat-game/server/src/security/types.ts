/**
 * 安全系统共享类型定义
 */

import type { Request } from 'express';

// ===== 通用 =====
export interface AuthenticatedRequest extends Request {
  userId?: string;
  deviceId?: string;
  riskScore?: number;
}

export interface SecurityResult {
  passed: boolean;
  reason?: string;
  action?: 'block' | 'challenge' | 'warn' | 'log';
  violations?: string[];
}

// ===== 防机器人 =====
export interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
  blocked: boolean;
  blockUntil?: number;
}

export interface DeviceFingerprint {
  deviceId: string;
  userId?: string;
  userAgent: string;
  acceptLanguage: string;
  screenResolution?: string;
  timezone?: string;
  platform?: string;
  firstSeen: number;
  lastSeen: number;
  requestCount: number;
  riskScore: number;
  banned: boolean;
}

// ===== 内容审核 =====
export type ViolationType =
  | 'profanity'      // 脏话辱骂
  | 'sexual'         // 色情
  | 'violence'       // 暴力
  | 'spam'           // 广告垃圾
  | 'scam'           // 诈骗
  | 'sensitive'      // 敏感词
  | 'prompt_injection'; // 提示词注入

export interface ContentScanResult {
  passed: boolean;
  cleaned: string;
  violations: { type: ViolationType; matched: string[]; severity: 'low' | 'medium' | 'high' }[];
  blocked: boolean;
  reason?: string;
}

// ===== 用户安全 =====
export type ViolationRecordType =
  | 'profanity'
  | 'sexual'
  | 'violence'
  | 'spam'
  | 'scam'
  | 'abuse'
  | 'prompt_injection'
  | 'rate_limit'
  | 'bot_detected'
  | 'multi_account';

export interface ViolationRecord {
  id: string;
  userId: string;
  type: ViolationRecordType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  content?: string;
  timestamp: number;
  resolved: boolean;
  reporterId?: string;
}

export interface UserSafetyProfile {
  userId: string;
  riskScore: number;       // 0-100
  violationCount: number;
  violations: ViolationRecord[];
  banned: boolean;
  banReason?: string;
  banUntil?: number;
  blockedUsers: string[];  // 拉黑的用户ID列表
  reportedBy: string[];   // 被谁举报过
  warnings: number;
  lastViolationTime: number;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  category: 'harassment' | 'spam' | 'inappropriate' | 'scam' | 'other';
  evidence?: string;
  timestamp: number;
  status: 'pending' | 'reviewing' | 'resolved';
}

// ===== AI 安全 =====
export interface PromptInjectionResult {
  detected: boolean;
  patterns: string[];
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  cleaned: string;
}

export interface AIOutputReviewResult {
  approved: boolean;
  issues: string[];
  reason?: string;
}
