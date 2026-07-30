/**
 * 用户安全系统
 * - 举报功能
 * - 拉黑功能
 * - 违规记录
 * - 自动封禁机制
 * - 风险用户评分
 */

import { v4 as uuidv4 } from 'uuid';
import { securityStore } from './riskStore';
import type { ReportRecord, UserSafetyProfile } from './types';

// =================== 举报功能 ===================
export function reportUser(
  reporterId: string,
  targetId: string,
  reason: string,
  category: ReportRecord['category'],
  evidence?: string,
): ReportRecord {
  const report: ReportRecord = {
    id: uuidv4(),
    reporterId,
    targetId,
    reason,
    category,
    evidence,
    timestamp: Date.now(),
    status: 'pending',
  };

  securityStore.addReport(report);

  // 检查是否触发自动封禁
  const targetProfile = securityStore.getUserProfile(targetId);
  if (targetProfile.reportedBy.length >= 3) {
    // 被 3 人以上举报 -> 临时封禁待审
    securityStore.banUser(targetId, '被多人举报，待人工审核', 60 * 60 * 1000);
  }

  return report;
}

export function getReports(targetId?: string): ReportRecord[] {
  return securityStore.getReports(targetId);
}

export function resolveReport(reportId: string, approved: boolean): void {
  const reports = securityStore.getReports();
  const report = reports.find((r) => r.id === reportId);
  if (report) {
    report.status = 'resolved';
    if (approved) {
      // 举报成立 -> 封禁目标用户
      securityStore.banUser(report.targetId, `举报成立: ${report.reason}`, 24 * 60 * 60 * 1000);
    }
  }
}

// =================== 拉黑功能 ===================
export function blockUser(userId: string, targetId: string): void {
  securityStore.blockUser(userId, targetId);
}

export function unblockUser(userId: string, targetId: string): void {
  securityStore.unblockUser(userId, targetId);
}

export function isBlocked(userId: string, targetId: string): boolean {
  return securityStore.isBlocked(userId, targetId);
}

export function getBlockedUsers(userId: string): string[] {
  return securityStore.getUserProfile(userId).blockedUsers;
}

// =================== 违规记录 ===================
export function getViolationHistory(userId: string) {
  return securityStore.getViolations(userId);
}

// =================== 风险用户评分 ===================
export function getRiskScore(userId: string): number {
  return securityStore.getUserProfile(userId).riskScore;
}

export function getRiskLevel(userId: string): 'safe' | 'low' | 'medium' | 'high' | 'dangerous' {
  const score = getRiskScore(userId);
  if (score >= 80) return 'dangerous';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

export function getUserSafetyProfile(userId: string): UserSafetyProfile {
  return securityStore.getUserProfile(userId);
}

// =================== 自动封禁 ===================
export function checkAndAutoBan(userId: string): { banned: boolean; reason?: string } {
  const result = securityStore.checkAutoBan(userId);
  if (result.shouldBan) {
    securityStore.banUser(userId, result.reason, 24 * 60 * 60 * 1000);
    return { banned: true, reason: result.reason };
  }
  return { banned: false };
}

// =================== 管理员操作 ===================
export function adminBanUser(userId: string, reason: string, durationMs?: number): void {
  securityStore.banUser(userId, reason, durationMs);
}

export function adminUnbanUser(userId: string): void {
  securityStore.unbanUser(userId);
}

export function adminBanIP(ip: string): void {
  securityStore.banIP(ip);
}

export function getSecurityStats() {
  return securityStore.getStats();
}
