import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { GameSession, Message, ChatPartner, PlayerStats, AIPersonality } from '../types';
import { getContextualResponse, getResponseDelay, generateAIName } from '../utils/aiResponses';

interface GameState {
  currentSession: GameSession | null;
  playerStats: PlayerStats;
  isMatching: boolean;
  isTyping: boolean;
  countdown: number;
  gameHistory: GameSession[];
}

type GameAction =
  | { type: 'START_MATCHING' }
  | { type: 'MATCH_SUCCESS'; payload: ChatPartner }
  | { type: 'SEND_MESSAGE'; payload: { text: string; messageId: string } }
  | { type: 'RECEIVE_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { messageId: string; status: 'delivered' | 'read' } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_COUNTDOWN'; payload: number }
  | { type: 'MAKE_GUESS'; payload: 'human' | 'ai' }
  | { type: 'END_SESSION' }
  | { type: 'LOAD_STATS'; payload: PlayerStats };

const initialStats: PlayerStats = {
  totalGames: 0,
  correctGuesses: 0,
  winStreak: 0,
  maxStreak: 0,
  level: 1,
  experience: 0,
  achievements: [],
  averageTime: 0,
};

const initialState: GameState = {
  currentSession: null,
  playerStats: initialStats,
  isMatching: false,
  isTyping: false,
  countdown: 60,
  gameHistory: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_MATCHING':
      return {
        ...state,
        isMatching: true,
      };

    case 'MATCH_SUCCESS':
      const newSession: GameSession = {
        id: Date.now().toString(),
        partner: action.payload,
        messages: [],
        startTime: new Date(),
        score: 0,
      };
      return {
        ...state,
        currentSession: newSession,
        isMatching: false,
        countdown: 60,
      };

    case 'SEND_MESSAGE':
      if (!state.currentSession) return state;

      const playerMessage: Message = {
        id: action.payload.messageId,
        text: action.payload.text,
        sender: 'player',
        timestamp: new Date(),
        status: 'sent',
      };

      // AI自动回复
      const personality = state.currentSession.partner.personality || 'rational';
      const aiResponse = getContextualResponse(personality, action.payload.text);
      const delay = getResponseDelay(personality);

      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'opponent',
          timestamp: new Date(),
        };
        // 这个会在组件中处理
      }, delay);

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: [...state.currentSession.messages, playerMessage],
        },
        countdown: 60,
      };

    case 'RECEIVE_MESSAGE':
      if (!state.currentSession) return state;

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: [...state.currentSession.messages, action.payload],
        },
        isTyping: false,
        countdown: 60,
      };

    case 'UPDATE_MESSAGE_STATUS':
      if (!state.currentSession) return state;

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: state.currentSession.messages.map(msg =>
            msg.id === action.payload.messageId
              ? { ...msg, status: action.payload.status }
              : msg
          ),
        },
      };

    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };

    case 'SET_COUNTDOWN':
      return {
        ...state,
        countdown: action.payload,
      };

    case 'MAKE_GUESS':
      if (!state.currentSession) return state;

      const isCorrect = action.payload === (state.currentSession.partner.isAI ? 'ai' : 'human');
      const score = calculateScore(state.currentSession, isCorrect);

      // 对方认为你是 AI 还是真人（模拟）
      const opponentGuess: 'human' | 'ai' = Math.random() > 0.5 ? 'human' : 'ai';
      const opponentCorrect = opponentGuess === 'ai';

      const updatedSession: GameSession = {
        ...state.currentSession,
        playerGuess: action.payload,
        opponentGuess,
        isCorrect,
        opponentCorrect,
        score,
        endTime: new Date(),
      };

      const newWinStreak = isCorrect ? state.playerStats.winStreak + 1 : 0;
      const experience = state.playerStats.experience + score;
      const levelUp = experience >= state.playerStats.level * 100;

      return {
        ...state,
        currentSession: updatedSession,
        gameHistory: [...state.gameHistory, updatedSession],
        playerStats: {
          ...state.playerStats,
          totalGames: state.playerStats.totalGames + 1,
          correctGuesses: isCorrect
            ? state.playerStats.correctGuesses + 1
            : state.playerStats.correctGuesses,
          winStreak: newWinStreak,
          maxStreak: Math.max(state.playerStats.maxStreak, newWinStreak),
          level: levelUp ? state.playerStats.level + 1 : state.playerStats.level,
          experience: levelUp ? experience - state.playerStats.level * 100 : experience,
        },
      };

    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
        isTyping: false,
        countdown: 60,
      };

    case 'LOAD_STATS':
      return {
        ...state,
        playerStats: action.payload,
      };

    default:
      return state;
  }
}

function calculateScore(session: GameSession, isCorrect: boolean): number {
  if (!isCorrect) return 0;

  let score = 100; // 基础分

  // 聊天时间越长，分数越高（最多加50分）
  const chatDuration = session.endTime
    ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
    : 0;
  score += Math.min(50, chatDuration / 10);

  // 消息数量加成（最多加30分）
  const messageCount = session.messages.length;
  score += Math.min(30, messageCount * 5);

  return Math.round(score);
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startMatching: () => void;
  sendMessage: (text: string) => void;
  makeGuess: (guess: 'human' | 'ai') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startMatching = () => {
    dispatch({ type: 'START_MATCHING' });

    // 模拟匹配过程（2-4秒）
    const matchTime = 2000 + Math.random() * 2000;

    setTimeout(() => {
      const personalities: AIPersonality[] = ['cold', 'energetic', 'humorous', 'rational', 'emotional'];
      const personality = personalities[Math.floor(Math.random() * personalities.length)];
      const name = generateAIName(personality);

      const partner: ChatPartner = {
        id: Math.random().toString(36).substring(7),
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        isOnline: true,
        isAI: Math.random() > 0.5, // 50%概率是AI
        personality,
      };

      dispatch({ type: 'MATCH_SUCCESS', payload: partner });
    }, matchTime);
  };

  const sendMessage = (text: string) => {
    const messageId = Date.now().toString();
    dispatch({ type: 'SEND_MESSAGE', payload: { text, messageId } });

    if (!state.currentSession) return;

    // 更新消息状态为已送达
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: {
          messageId,
          status: 'delivered',
        },
      });
    }, 500);

    // 更新为已读
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: {
          messageId,
          status: 'read',
        },
      });
    }, 1000);

    // 显示正在输入
    const personality = state.currentSession.partner.personality || 'rational';
    const typingDelay = 500 + Math.random() * 1000;
    const responseDelay = getResponseDelay(personality);

    setTimeout(() => {
      dispatch({ type: 'SET_TYPING', payload: true });
    }, typingDelay);

    // AI回复
    if (state.currentSession.partner.isAI) {
      const aiResponse = getContextualResponse(personality, text);

      setTimeout(() => {
        dispatch({ type: 'SET_TYPING', payload: false });

        const aiMessage: Message = {
          id: Date.now().toString(),
          text: aiResponse,
          sender: 'opponent',
          timestamp: new Date(),
        };

        dispatch({ type: 'RECEIVE_MESSAGE', payload: aiMessage });
      }, responseDelay);
    } else {
      // 真人回复（模拟）
      const humanDelay = 3000 + Math.random() * 5000;

      setTimeout(() => {
        dispatch({ type: 'SET_TYPING', payload: false });

        const humanResponses = [
          "嗯嗯",
          "好的",
          "哈哈",
          "是啊",
          "你呢？",
          "有道理",
          "确实",
          "嗯...",
        ];

        const humanMessage: Message = {
          id: Date.now().toString(),
          text: humanResponses[Math.floor(Math.random() * humanResponses.length)],
          sender: 'opponent',
          timestamp: new Date(),
        };

        dispatch({ type: 'RECEIVE_MESSAGE', payload: humanMessage });
      }, humanDelay);
    }
  };

  const makeGuess = (guess: 'human' | 'ai') => {
    dispatch({ type: 'MAKE_GUESS', payload: guess });
  };

  return (
    <GameContext.Provider value={{ state, dispatch, startMatching, sendMessage, makeGuess }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}