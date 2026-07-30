/**
 * DeepSeek AI 调用模块
 * - OpenAI 兼容接口（/v1/chat/completions）
 * - 5 种人格系统提示词（与前端 AIPersonality 对齐）
 * - 集成 SYSTEM_SAFETY_PROMPT 防注入
 * - 支持多轮对话历史
 * - 错误处理 + 超时 + 降级
 */

import { getAPIKey } from '../security/dataSecurity';
import { SYSTEM_SAFETY_PROMPT } from '../security/aiSafety';

// =================== 类型定义 ===================
export type AIPersonality = 'cold' | 'energetic' | 'humorous' | 'rational' | 'emotional';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekOptions {
  personality: AIPersonality;
  history?: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface DeepSeekResult {
  success: boolean;
  reply: string;
  error?: string;
  tokensUsed?: number;
}

// =================== DeepSeek API 配置 ===================
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const REQUEST_TIMEOUT_MS = 15000;

// =================== DeepSeek 响应类型 ===================
interface DeepSeekResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  usage?: { total_tokens?: number };
}

// =================== 人格系统提示词 ===================
const PERSONALITY_PROMPTS: Record<AIPersonality, string> = {
  cold: `你正在扮演一个性格冷淡、话不多的真实人类网友（高冷型）。
要求：
- 回复非常简短，常用「嗯」「哦」「随便」「无所谓」「所以呢」这类词
- 不主动展开话题，问什么答什么
- 偶尔显得有点不耐烦
- 但依然是真人，会偶尔反问、发表情、出错别字
- 不要让玩家轻易判断出你是 AI`,
  energetic: `你正在扮演一个性格活泼、热情洋溢的真实人类网友（活泼型）。
要求：
- 语气欢快，多用「哇」「天哪」「超」「！」等
- 主动延展话题，会追问、表达好奇
- 偶尔会发叠词、语气词
- 像在和一个新认识的朋友聊天
- 不要让玩家轻易判断出你是 AI`,
  humorous: `你正在扮演一个幽默爱开玩笑、爱自嘲的真实人类网友（幽默型）。
要求：
- 经常抖机灵、用比喻、自嘲
- 偶尔用 emoji 但不滥用
- 会反问、调侃玩家
- 回答有反转感，但依然自然
- 不要让玩家轻易判断出你是 AI`,
  rational: `你正在扮演一个理性、逻辑清晰的真实人类网友（理性型）。
要求：
- 回复有条理，偶尔分点
- 用词偏书面但不生硬
- 喜欢从多个角度分析
- 但依然是聊天口吻，不是写论文
- 不要让玩家轻易判断出你是 AI`,
  emotional: `你正在扮演一个情绪丰富、感性细腻的真实人类网友（情绪化型）。
要求：
- 表达会有情绪波动，偶尔感性
- 会分享感受、回忆
- 对玩家的态度比较在意
- 语气温暖但不腻
- 不要让玩家轻易判断出你是 AI`,
};

// =================== 构造对话消息 ===================
function buildMessages(userText: string, opts: DeepSeekOptions): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${SYSTEM_SAFETY_PROMPT}\n\n${PERSONALITY_PROMPTS[opts.personality]}`,
    },
  ];

  // 历史对话（最近 10 轮，避免 token 超限）
  if (opts.history && opts.history.length > 0) {
    const recent = opts.history.slice(-20);
    for (const msg of recent) {
      // 只保留 user / assistant 角色，system 已合并到上面
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  // 当前用户消息
  messages.push({ role: 'user', content: userText });

  return messages;
}

// =================== 调用 DeepSeek ===================
export async function callDeepSeek(
  userText: string,
  opts: DeepSeekOptions
): Promise<DeepSeekResult> {
  const apiKey = getAPIKey('deepseek');

  if (!apiKey) {
    return {
      success: false,
      reply: '',
      error: 'DEEPSEEK_API_KEY_NOT_CONFIGURED',
    };
  }

  const messages = buildMessages(userText, opts);

  const body = {
    model: DEEPSEEK_MODEL,
    messages,
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 200,
    stream: false,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[DEEPSEEK] HTTP ${res.status}: ${errText}`);
      return {
        success: false,
        reply: '',
        error: `DEEPSEEK_HTTP_${res.status}`,
      };
    }

    const data = (await res.json()) as DeepSeekResponse;
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!reply) {
      return { success: false, reply: '', error: 'EMPTY_REPLY' };
    }

    return {
      success: true,
      reply,
      tokensUsed: data?.usage?.total_tokens,
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.error('[DEEPSEEK] 请求超时');
      return { success: false, reply: '', error: 'TIMEOUT' };
    }
    console.error('[DEEPSEEK] 调用异常:', err?.message);
    return { success: false, reply: '', error: 'NETWORK_ERROR' };
  } finally {
    clearTimeout(timer);
  }
}

// =================== 降级回复（API 失败时使用） ===================
const FALLBACK_RESPONSES: Record<AIPersonality, string[]> = {
  cold: ['嗯。', '哦。', '随便。'],
  energetic: ['哇！继续说！', '天哪太有趣了！'],
  humorous: ['哈哈，这个问题把我问住了。', '让我想想...哈哈'],
  rational: ['这是一个值得思考的问题。', '让我分析一下。'],
  emotional: ['嗯...我在听。', '你说的有道理。'],
};

export function getFallbackReply(personality: AIPersonality): string {
  const arr = FALLBACK_RESPONSES[personality] || FALLBACK_RESPONSES.rational;
  return arr[Math.floor(Math.random() * arr.length)];
}
