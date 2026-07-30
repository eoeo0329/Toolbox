/**
 * 前端 API 客户端
 * - 自动管理 token（无 token 时自动游客登录）
 * - 封装后端 /api/ai/chat 调用
 */

import type { AIPersonality } from '../types';

// 开发环境走 vite proxy（相对路径 /api -> localhost:3001），避免跨域和端口暴露
// 生产环境可通过 VITE_API_BASE 指定后端地址
const API_BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'ai_challenge_token';

// =================== Token 管理 ===================
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

async function ensureToken(): Promise<string> {
  const existing = getToken();
  if (existing) return existing;

  const res = await fetch(`${API_BASE}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`游客登录失败: ${res.status}`);
  }

  const data = await res.json();
  setToken(data.token);
  return data.token;
}

// =================== AI 聊天 ===================
export interface AIChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResult {
  reply: string;
  personality: AIPersonality;
  degraded?: boolean;
  filtered?: boolean;
  warning?: string;
}

export async function chatWithAI(
  text: string,
  personality: AIPersonality,
  history: AIChatHistoryItem[] = []
): Promise<AIChatResult> {
  const token = await ensureToken();

  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, personality, history }),
  });

  // Token 失效 -> 清掉重新获取后重试一次
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    const newToken = await ensureToken();
    const retryRes = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
      },
      body: JSON.stringify({ text, personality, history }),
    });
    if (!retryRes.ok) {
      throw new Error(`AI 调用失败: ${retryRes.status}`);
    }
    return retryRes.json();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI 调用失败: ${res.status}`);
  }

  return res.json();
}

// =================== 健康检查 ===================
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export { API_BASE };
