'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Post, Settings, Notification, Conversation } from '@/types';
import { mockCurrentUser, mockUsers, mockPosts, mockTopics, mockDefaultSettings } from '@/lib/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  topics: typeof mockTopics;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  notifications: Notification[];
  unreadNotificationsCount: number;
  conversations: Conversation[];
  unreadMessagesCount: number;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  addPost: (content: string, images?: string[], topicId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [topics] = useState(mockTopics);
  const [settings, setSettings] = useState<Settings>(mockDefaultSettings);
  const [notifications] = useState<Notification[]>([]);
  const [conversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Auto login for demo
    setCurrentUser(mockCurrentUser);
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('community_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('community_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const login = useCallback(async (_username: string, _password: string): Promise<boolean> => {
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentUser(mockCurrentUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
        };
      }
      return post;
    }));
  }, []);

  const toggleBookmark = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked,
          bookmarksCount: post.isBookmarked ? post.bookmarksCount - 1 : post.bookmarksCount + 1,
        };
      }
      return post;
    }));
  }, []);

  const toggleFollow = useCallback((userId: string) => {
    // This would also update backend in real app
    console.log('Toggle follow for user:', userId);
  }, []);

  const addPost = useCallback((content: string, images: string[] = [], topicId?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      authorId: currentUser?.id || '1',
      content,
      images,
      topicId,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      viewsCount: 0,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [newPost, ...prev]);
  }, [currentUser]);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        posts,
        setPosts,
        topics,
        settings,
        updateSettings,
        notifications,
        unreadNotificationsCount,
        conversations,
        unreadMessagesCount,
        login,
        logout,
        toggleLike,
        toggleBookmark,
        toggleFollow,
        addPost,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
