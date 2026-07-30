export interface User {
  id: string;
  uid: string;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  level: number;
  points: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  images: string[];
  topicId?: string;
  topic?: Topic;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isHot?: boolean;
  isPinned?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  likesCount: number;
  replyToId?: string;
  replyTo?: Comment;
  replies: Comment[];
  isLiked?: boolean;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postsCount: number;
  followersCount: number;
  isFollowing?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image';
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participant?: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  userId: string;
  fromUserId?: string;
  fromUser?: User;
  postId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'post' | 'comment' | 'like' | 'bookmark' | 'follow';
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  location?: string;
  participantsCount: number;
  maxParticipants?: number;
  isJoined?: boolean;
  organizerId: string;
  organizer?: User;
}

export interface LeaderboardItem {
  userId: string;
  user?: User;
  rank: number;
  value: number;
}

export interface Settings {
  darkMode: boolean;
  autoDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  reduceMotion: boolean;
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    system: boolean;
  };
  privacy: {
    showPosts: 'public' | 'followers' | 'private';
    showFollowing: boolean;
    showFollowers: boolean;
    allowMessages: 'everyone' | 'followers' | 'nobody';
  };
}
