export type AIPersonality = 'cold' | 'energetic' | 'humorous' | 'rational' | 'emotional';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  sender: 'player' | 'opponent';
  timestamp: Date;
  status?: MessageStatus;
  readAt?: Date;
}

export interface ChatPartner {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isAI: boolean;
  personality?: AIPersonality;
}

export interface GameSession {
  id: string;
  partner: ChatPartner;
  messages: Message[];
  startTime: Date;
  endTime?: Date;
  playerGuess?: 'human' | 'ai';
  opponentGuess?: 'human' | 'ai';
  isCorrect?: boolean;
  opponentCorrect?: boolean;
  score: number;
}

export interface PlayerStats {
  totalGames: number;
  correctGuesses: number;
  winStreak: number;
  maxStreak: number;
  level: number;
  experience: number;
  achievements: string[];
  averageTime: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export type AIResponse = {
  personality: AIPersonality;
  response: string;
  delay: number;
};