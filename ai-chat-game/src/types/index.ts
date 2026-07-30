export type Gender = 'female' | 'male' | 'other';

export interface AIAvatar {
  id: string;
  name: string;
  personality: string;
  bio: string;
  description: string;
  category: string;
  tags: string[];
  gender: Gender;
  age: number;
  height?: string;
  creator: string;
  views: number;
  chats: number;
  gradient: string; // gradient class e.g. grad-1
  emoji: string;
  sampleReplies: string[]; // sample opening / responses
  isNew?: boolean;
  isFeatured?: boolean;
  custom?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  text?: string;
  image?: string;
  voice?: { duration: number };
  time: number;
  status?: 'sending' | 'sent' | 'read';
}

export interface ChatSession {
  id: string;
  avatarId: string;
  title: string;
  messages: Message[];
  lastTime: number;
  unread: number;
  memory: string[]; // AI memory facts
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  bio?: string;
  joinedAt: number;
}

export type Tab = 'home' | 'explore' | 'create' | 'chats' | 'profile';
