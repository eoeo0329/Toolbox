/**
 * 聊天内容安全系统
 * - 实时检测辱骂、脏话、攻击性语言
 * - 色情、暴力、广告、诈骗内容过滤
 * - 敏感词库匹配
 * - AI 内容审核
 * - 违规消息拦截
 */

import { SENSITIVE_WORDS } from './sensitiveWords';
import { securityStore } from './riskStore';
import type { ContentScanResult, ViolationType, ViolationRecord } from './types';
import { v4 as uuidv4 } from 'uuid';

// =================== 敏感词索引（构建为单次匹配） ===================
interface WordEntry {
  word: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
}

const wordIndex: WordEntry[] = [];
for (const group of SENSITIVE_WORDS) {
  for (const word of group.words) {
    wordIndex.push({ word, category: group.category, severity: group.severity });
  }
}
// 按长度降序排列，优先匹配长词
wordIndex.sort((a, b) => b.word.length - a.word.length);

// =================== 内容扫描核心 ===================
export function scanContent(text: string): ContentScanResult {
  const violations: ContentScanResult['violations'] = [];
  let cleaned = text;

  const matchedByCategory = new Map<string, string[]>();

  for (const entry of wordIndex) {
    const regex = new RegExp(escapeRegExp(entry.word), 'gi');
    if (regex.test(text)) {
      // 记录匹配
      if (!matchedByCategory.has(entry.category)) {
        matchedByCategory.set(entry.category, []);
      }
      matchedByCategory.get(entry.category)!.push(entry.word);

      // 替换为星号
      cleaned = cleaned.replace(regex, '*'.repeat(entry.word.length));
    }
  }

  // 组织违规列表
  for (const [category, words] of matchedByCategory) {
    const group = SENSITIVE_WORDS.find((g) => g.category === category)!;
    violations.push({
      type: category as ViolationType,
      matched: words,
      severity: group.severity,
    });
  }

  // 检查是否需要拦截（high severity 直接拦截）
  const hasHighSeverity = violations.some((v) => v.severity === 'high');
  const hasMultipleViolations = violations.length >= 2;

  const blocked = hasHighSeverity || hasMultipleViolations;

  return {
    passed: violations.length === 0,
    cleaned,
    violations,
    blocked,
    reason: blocked
      ? `检测到 ${violations.length} 类违规内容: ${violations.map((v) => v.type).join(', ')}`
      : violations.length > 0
        ? `内容包含敏感词，已自动过滤`
        : undefined,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =================== AI 内容审核（模拟） ===================
// 生产环境接入真正的 AI 审核服务（如 OpenAI Moderation API）
export async function aiContentReview(text: string): Promise<{
  flagged: boolean;
  categories: string[];
  confidence: number;
}> {
  // 基于规则的模拟审核
  const categories: string[] = [];

  // 检测色情暗示
  if (/约|约吗|一夜|裸|私密照片|看看身材/i.test(text)) {
    categories.push('sexual');
  }

  // 检测诈骗
  if (/转账|汇款|银行卡|验证码|投资|稳赚|高额回报/i.test(text)) {
    categories.push('scam');
  }

  // 检测广告
  if (/加(我|微信|QQ)|扫码|免费领|代理|刷单/i.test(text)) {
    categories.push('spam');
  }

  // 检测人身攻击
  if (/你是(猪|狗|蠢|傻)|滚|闭嘴|你算什么/i.test(text)) {
    categories.push('harassment');
  }

  return {
    flagged: categories.length > 0,
    categories,
    confidence: categories.length > 0 ? 0.85 : 0.95,
  };
}

// =================== 消息处理管道 ===================
export interface MessageProcessResult {
  approved: boolean;
  text: string;          // 清洗后的文本
  blocked: boolean;
  reason?: string;
  violations: ViolationRecord[];
}

export async function processOutgoingMessage(
  userId: string,
  text: string,
): Promise<MessageProcessResult> {
  const violations: ViolationRecord[] = [];
  const now = Date.now();

  // 第一步：敏感词扫描
  const scanResult = scanContent(text);

  // 第二步：AI 内容审核
  const aiReview = await aiContentReview(text);

  // 合并违规
  const allViolations = [...scanResult.violations];
  if (aiReview.flagged) {
    for (const cat of aiReview.categories) {
      if (!allViolations.find((v) => v.type === cat)) {
        allViolations.push({
          type: cat as ViolationType,
          matched: [],
          severity: 'high',
        });
      }
    }
  }

  // 记录违规
  for (const v of allViolations) {
    const record: ViolationRecord = {
      id: uuidv4(),
      userId,
      type: v.type as any,
      severity: v.severity,
      description: `发送消息包含 ${v.type} 内容`,
      content: text.substring(0, 100),
      timestamp: now,
      resolved: false,
    };
    violations.push(record);
    securityStore.addViolation(record);
  }

  // 拦截判定
  const blocked = scanResult.blocked || aiReview.flagged;

  return {
    approved: !blocked,
    text: scanResult.cleaned,
    blocked,
    reason: blocked
      ? `消息被拦截：${allViolations.map((v) => v.type).join(', ')}`
      : allViolations.length > 0
        ? '消息已过滤敏感词后发送'
        : undefined,
    violations,
  };
}

// =================== 自动封禁检查 ===================
export function checkAutoBanAfterViolation(userId: string): { banned: boolean; reason?: string } {
  const result = securityStore.checkAutoBan(userId);
  if (result.shouldBan) {
    securityStore.banUser(userId, result.reason, 24 * 60 * 60 * 1000); // 封禁 24 小时
    return { banned: true, reason: result.reason };
  }
  return { banned: false };
}
