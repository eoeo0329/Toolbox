/**
 * 安全数据存储（内存版，生产环境替换为 Redis / PostgreSQL）
 * 管理限流计数、设备指纹、违规记录、风险评分、封禁状态
 */

import { DeviceFingerprint, UserSafetyProfile, ViolationRecord, ReportRecord } from './types';

class SecurityStore {
  // 限流：<ip, Map<route, { count, first, last, blocked, blockUntil }>>
  private rateLimits = new Map<string, Map<string, { count: number; first: number; last: number; blocked: boolean; blockUntil?: number }>>();

  // 设备指纹
  private devices = new Map<string, DeviceFingerprint>();

  // 用户安全档案
  private userProfiles = new Map<string, UserSafetyProfile>();

  // 违规记录
  private violations: ViolationRecord[] = [];

  // 举报记录
  private reports: ReportRecord[] = [];

  // 黑名单 IP
  private bannedIPs = new Set<string>();

  // 黑名单设备
  private bannedDevices = new Set<string>();

  // ===== 限流 =====
  getRateLimit(ip: string, route: string) {
    return this.rateLimits.get(ip)?.get(route);
  }

  setRateLimit(ip: string, route: string, data: { count: number; first: number; last: number; blocked: boolean; blockUntil?: number }) {
    if (!this.rateLimits.has(ip)) this.rateLimits.set(ip, new Map());
    this.rateLimits.get(ip)!.set(route, data);
  }

  // ===== 设备指纹 =====
  getDevice(deviceId: string): DeviceFingerprint | undefined {
    return this.devices.get(deviceId);
  }

  setDevice(device: DeviceFingerprint) {
    this.devices.set(device.deviceId, device);
  }

  banDevice(deviceId: string) {
    this.bannedDevices.add(deviceId);
    const d = this.devices.get(deviceId);
    if (d) {
      d.banned = true;
      this.devices.set(deviceId, d);
    }
  }

  isDeviceBanned(deviceId: string): boolean {
    return this.bannedDevices.has(deviceId);
  }

  // ===== 用户安全档案 =====
  getUserProfile(userId: string): UserSafetyProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        riskScore: 0,
        violationCount: 0,
        violations: [],
        banned: false,
        blockedUsers: [],
        reportedBy: [],
        warnings: 0,
        lastViolationTime: 0,
      });
    }
    return this.userProfiles.get(userId)!;
  }

  updateUserProfile(userId: string, updater: (p: UserSafetyProfile) => UserSafetyProfile) {
    const profile = this.getUserProfile(userId);
    const updated = updater({ ...profile });
    this.userProfiles.set(userId, updated);
    return updated;
  }

  banUser(userId: string, reason: string, durationMs?: number) {
    this.updateUserProfile(userId, (p) => ({
      ...p,
      banned: true,
      banReason: reason,
      banUntil: durationMs ? Date.now() + durationMs : undefined,
    }));
  }

  unbanUser(userId: string) {
    this.updateUserProfile(userId, (p) => ({
      ...p,
      banned: false,
      banReason: undefined,
      banUntil: undefined,
    }));
  }

  isUserBanned(userId: string): boolean {
    const p = this.getUserProfile(userId);
    if (p.banned && p.banUntil && Date.now() > p.banUntil) {
      // 临时封禁已过期
      this.unbanUser(userId);
      return false;
    }
    return p.banned;
  }

  // ===== 违规记录 =====
  addViolation(record: ViolationRecord) {
    this.violations.push(record);
    // 更新用户档案
    this.updateUserProfile(record.userId, (p) => ({
      ...p,
      violationCount: p.violationCount + 1,
      violations: [...p.violations, record],
      lastViolationTime: record.timestamp,
      // 风险评分递增
      riskScore: Math.min(100, p.riskScore + this.violationScore(record.severity)),
    }));
  }

  private violationScore(severity: 'low' | 'medium' | 'high'): number {
    return severity === 'high' ? 20 : severity === 'medium' ? 10 : 3;
  }

  getViolations(userId: string): ViolationRecord[] {
    return this.violations.filter((v) => v.userId === userId);
  }

  // ===== 举报 =====
  addReport(report: ReportRecord) {
    this.reports.push(report);
    // 被举报增加风险分
    this.updateUserProfile(report.targetId, (p) => ({
      ...p,
      reportedBy: p.reportedBy.includes(report.reporterId)
        ? p.reportedBy
        : [...p.reportedBy, report.reporterId],
      riskScore: Math.min(100, p.riskScore + 5),
    }));
  }

  getReports(targetId?: string): ReportRecord[] {
    return targetId ? this.reports.filter((r) => r.targetId === targetId) : this.reports;
  }

  // ===== 拉黑 =====
  blockUser(userId: string, targetId: string) {
    this.updateUserProfile(userId, (p) => ({
      ...p,
      blockedUsers: p.blockedUsers.includes(targetId) ? p.blockedUsers : [...p.blockedUsers, targetId],
    }));
  }

  unblockUser(userId: string, targetId: string) {
    this.updateUserProfile(userId, (p) => ({
      ...p,
      blockedUsers: p.blockedUsers.filter((u) => u !== targetId),
    }));
  }

  isBlocked(userId: string, targetId: string): boolean {
    return this.getUserProfile(userId).blockedUsers.includes(targetId);
  }

  // ===== IP 封禁 =====
  banIP(ip: string) {
    this.bannedIPs.add(ip);
  }

  isIPBanned(ip: string): boolean {
    return this.bannedIPs.has(ip);
  }

  // ===== 自动封禁检查 =====
  checkAutoBan(userId: string): { shouldBan: boolean; reason: string } {
    const p = this.getUserProfile(userId);
    const threshold = parseInt(process.env.AUTO_BAN_THRESHOLD || '5');

    // 违规次数达到阈值
    if (p.violationCount >= threshold) {
      return { shouldBan: true, reason: `累计 ${p.violationCount} 次违规，触发自动封禁` };
    }
    // 风险评分过高
    const riskThreshold = parseInt(process.env.RISK_SCORE_THRESHOLD || '70');
    if (p.riskScore >= riskThreshold) {
      return { shouldBan: true, reason: `风险评分 ${p.riskScore} 超过阈值，触发自动封禁` };
    }
    return { shouldBan: false, reason: '' };
  }

  // 统计（用于监控面板）
  getStats() {
    return {
      totalDevices: this.devices.size,
      totalUsers: this.userProfiles.size,
      bannedUsers: Array.from(this.userProfiles.values()).filter((p) => p.banned).length,
      bannedIPs: this.bannedIPs.size,
      bannedDevices: this.bannedDevices.size,
      totalViolations: this.violations.length,
      pendingReports: this.reports.filter((r) => r.status === 'pending').length,
    };
  }
}

export const securityStore = new SecurityStore();
