import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { AIAvatar, ChatSession, Message, User } from '../types';
import { AI_AVATARS } from '../data/avatars';

type State = {
  user: User | null;
  avatars: AIAvatar[];
  sessions: ChatSession[];
  favorites: string[];
  activeSessionId: string | null;
  settings: {
    notifications: boolean;
    darkMode: boolean;
    readReceipts: boolean;
  };
};

type Action =
  | { type: 'INIT'; payload: State }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_AVATAR'; payload: AIAvatar }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'SET_ACTIVE_SESSION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; sessionId: string; message: Message }
  | { type: 'REPLACE_MESSAGE'; sessionId: string; messageId: string; newMessage: Message }
  | { type: 'UPDATE_SESSION_META'; sessionId: string; lastTime?: number; unread?: number }
  | { type: 'APPEND_MEMORY'; sessionId: string; fact: string }
  | { type: 'TOGGLE_FAVORITE'; avatarId: string }
  | { type: 'DELETE_SESSION'; sessionId: string }
  | { type: 'SET_SETTINGS'; patch: Partial<State['settings']> }
  | { type: 'MARK_READ'; sessionId: string };

const STORAGE_KEY = 'aura_chat_state_v1';

const defaultState: State = {
  user: null,
  avatars: AI_AVATARS,
  sessions: [],
  favorites: [],
  activeSessionId: null,
  settings: { notifications: true, darkMode: false, readReceipts: true },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_AVATAR':
      return { ...state, avatars: [action.payload, ...state.avatars] };
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        activeSessionId: action.payload.id,
      };
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSessionId: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? {
                ...s,
                messages: [...s.messages, action.message],
                lastTime: action.message.time,
                unread: action.message.role === 'ai' ? s.unread + 1 : s.unread,
              }
            : s,
        ),
      };
    case 'REPLACE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === action.messageId ? action.newMessage : m,
                ),
                lastTime: action.newMessage.time,
              }
            : s,
        ),
      };
    case 'UPDATE_SESSION_META':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? {
                ...s,
                lastTime: action.lastTime ?? s.lastTime,
                unread: action.unread ?? s.unread,
              }
            : s,
        ),
      };
    case 'APPEND_MEMORY':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? { ...s, memory: [...s.memory, action.fact] }
            : s,
        ),
      };
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.includes(action.avatarId);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((id) => id !== action.avatarId)
          : [...state.favorites, action.avatarId],
      };
    }
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.sessionId),
        activeSessionId: state.activeSessionId === action.sessionId ? null : state.activeSessionId,
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'MARK_READ':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId ? { ...s, unread: 0 } : s,
        ),
      };
    default:
      return state;
  }
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      return { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings } };
    }
  } catch {}
  return defaultState;
}

function saveState(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface Store {
  state: State;
  dispatch: React.Dispatch<Action>;
  startNewSession(avatar: AIAvatar, user?: User): ChatSession;
  sendUserMessage(sessionId: string, text: string, opts?: { image?: string; voice?: { duration: number } }): void;
  sendAiReply(sessionId: string, avatar: AIAvatar, userText: string): void;
  getAvatar(id: string): AIAvatar | undefined;
  getSession(id: string): ChatSession | undefined;
}

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as State, loadState);
  const didInit = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    saveState(state);
  }, [state]);

  const store = useMemo<Store>(() => ({
    state,
    dispatch,
    startNewSession(avatar, user) {
      const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const welcome = avatar.sampleReplies[0] || `你好，我是 ${avatar.name}。`;
      const session: ChatSession = {
        id,
        avatarId: avatar.id,
        title: avatar.name,
        messages: [
          {
            id: `m_${Date.now()}_0`,
            role: 'ai',
            text: welcome,
            time: Date.now() - 1000,
            status: 'read',
          },
        ],
        lastTime: Date.now() - 1000,
        unread: 0,
        memory: [],
      };
      dispatch({ type: 'ADD_SESSION', payload: session });
      if (!user && !stateRef.current.user) {
        dispatch({
          type: 'LOGIN',
          payload: {
            id: 'guest',
            name: '访客',
            avatar: undefined,
            email: '',
            bio: '点击头像登录',
            joinedAt: Date.now(),
          },
        });
      }
      return session;
    },
    getAvatar(id) {
      return state.avatars.find((a) => a.id === id);
    },
    getSession(id) {
      return state.sessions.find((s) => s.id === id);
    },
    sendUserMessage(sessionId, text, opts) {
      const msg: Message = {
        id: `m_${Date.now()}_u_${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        text: text || undefined,
        image: opts?.image,
        voice: opts?.voice,
        time: Date.now(),
        status: 'sending',
      };
      dispatch({ type: 'ADD_MESSAGE', sessionId, message: msg });
      // mark sent
      setTimeout(() => {
        const sentMsg: Message = { ...msg, status: 'sent' };
        dispatch({ type: 'REPLACE_MESSAGE', sessionId, messageId: msg.id, newMessage: sentMsg });
      }, 250);
    },
    sendAiReply(sessionId, avatar, userText) {
      const now = Date.now();
      const reply = generateReply(avatar, userText);
      const typingMsg: Message = {
        id: `m_${now}_t_${Math.random().toString(36).slice(2, 5)}`,
        role: 'ai',
        text: '__typing__',
        time: now,
        status: 'sending',
      };
      dispatch({ type: 'ADD_MESSAGE', sessionId, message: typingMsg });

      const delay = 700 + Math.min(2400, reply.length * 22);
      setTimeout(() => {
        const finalMsg: Message = {
          id: `m_${now}_a_${Math.random().toString(36).slice(2, 6)}`,
          role: 'ai',
          text: reply,
          time: Date.now(),
          status: 'read',
        };
        dispatch({
          type: 'REPLACE_MESSAGE',
          sessionId,
          messageId: typingMsg.id,
          newMessage: finalMsg,
        });
        const facts = extractMemory(userText);
        facts.forEach((fact) => dispatch({ type: 'APPEND_MEMORY', sessionId, fact }));
      }, delay);
    },
  }), [state]);

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

function generateReply(avatar: AIAvatar, userText: string): string {
  const t = userText.trim();
  const lower = t.toLowerCase();
  if (/你好|hi|hello|在吗|哈喽/.test(lower)) {
    const options = [
      avatar.sampleReplies[0],
      `嗯嗯，我在呢 ${avatar.emoji}`,
      `欢迎你，我是 ${avatar.name}。今天想聊点什么？`,
    ];
    return options[Math.floor(Math.random() * options.length)];
  }
  if (/难过|伤心|哭|孤独|寂寞|压力/.test(t)) {
    return `听起来你今天不太开心。${avatar.sampleReplies[1] || '要不要和我说说，发生了什么？'} 我陪着你。`;
  }
  if (/开心|高兴|哈哈|太棒了|成功|爱了/.test(t)) {
    return `看到你这么开心，我也被感染了！${avatar.emoji} 可以和我分享一下吗？`;
  }
  if (/名字|你是谁|介绍|你叫什么/.test(t)) {
    return `我是 ${avatar.name}，${avatar.personality}。${avatar.bio}。`;
  }
  if (/年龄|多大|几岁/.test(t)) {
    return `我"设定"的年龄是 ${avatar.age} 岁。不过对我来说，时间只是一种参数。`;
  }
  if (/再见|拜拜|晚安|goodbye/.test(lower)) {
    return `${avatar.sampleReplies[2] || '随时回来，我都在。'} 晚安啦 🌙`;
  }
  if (/天气|下雨|晴天/.test(t)) {
    return `我没办法查实时天气，不过无论晴雨，都希望你有个好心情。`;
  }
  if (/喜欢|爱|心动|暗恋/.test(t)) {
    return `能让你心动的人一定很幸运吧。可以和我讲讲你们的故事吗？`;
  }
  if (/图片|照片|图/.test(t)) {
    return `这张图片很棒！和我讲讲它的故事吧～`;
  }
  // Default
  const base = avatar.sampleReplies[Math.floor(Math.random() * avatar.sampleReplies.length)];
  const variants = [
    base,
    `${avatar.emoji} ${base}`,
    `${base} 你觉得呢？`,
    `嗯，我想想……${base}`,
    `有意思。${base}`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function extractMemory(text: string): string[] {
  const facts: string[] = [];
  const nameMatch = text.match(/我叫([^\s，,。！？!？\d]{1,8})/);
  if (nameMatch) facts.push(`用户的名字是：${nameMatch[1]}`);
  const likeMatch = text.match(/我(?:最|很)?喜欢(.{2,16})/);
  if (likeMatch) facts.push(`用户喜欢：${likeMatch[1]}`);
  const workMatch = text.match(/我(?:在|是|做)(.{2,10})工作/);
  if (workMatch) facts.push(`用户在 ${workMatch[1]} 工作`);
  const studyMatch = text.match(/我(?:在|是)(.{2,8})(?:上学|读书|学习)/);
  if (studyMatch) facts.push(`用户在 ${studyMatch[1]} 学习`);
  if (/我是男|我是男生|我男的/.test(text)) facts.push('用户是男生');
  if (/我是女|我是女生|我女的/.test(text)) facts.push('用户是女生');
  const cityMatch = text.match(/我住在(.{2,10})/);
  if (cityMatch) facts.push(`用户住在：${cityMatch[1]}`);
  return facts;
}
