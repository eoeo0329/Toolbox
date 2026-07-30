'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Flame, Pin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import type { Post, User, Topic } from '@/types';
import { Avatar } from './Avatar';
import { LevelBadge } from './IconBadge';
import { useApp } from '@/context/AppContext';

interface PostCardProps {
  post: Post;
  author?: User;
  topic?: Topic;
  onOpen?: () => void;
  className?: string;
}

export function PostCard({ post, author, topic, onOpen, className }: PostCardProps) {
  const { toggleLike, toggleBookmark, users, topics } = useApp();
  
  const user = author || users.find(u => u.id === post.authorId);
  const topicData = topic || topics.find(t => t.id === post.topicId);

  const images = post.images || [];
  const hasMultipleImages = images.length > 1;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'bg-surface-light dark:bg-surface-dark rounded-ios shadow-ios overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div
        onClick={onOpen}
        className="flex items-center gap-3 px-5 pt-4 pb-3 cursor-pointer active:bg-ios-gray5/50 dark:active:bg-white/5 transition-colors"
      >
        {user && (
          <Link href={`/profile/${user.id}`} onClick={(e) => e.stopPropagation()}>
            <Avatar src={user.avatar} alt={user.nickname} size={44} fallback={user.nickname.charAt(0)} />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-semibold text-black dark:text-white truncate">
              {user?.nickname || '用户'}
            </span>
            {user && <LevelBadge level={user.level} size="sm" />}
            {user?.isVerified && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-ios-blue text-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[13px] text-ios-gray">
              {formatDate(post.createdAt)}
            </span>
            {topicData && (
              <>
                <span className="text-ios-gray4">·</span>
                <Link
                  href={`/topic/${topicData.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[13px] text-ios-blue hover:underline"
                >
                  #{topicData.name}
                </Link>
              </>
            )}
            {post.isPinned && <Pin size={12} className="text-ios-orange fill-ios-orange" />}
            {post.isHot && <Flame size={12} className="text-ios-red fill-ios-red" />}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); console.log('More options'); }}
          className="p-1.5 rounded-full text-ios-gray2 hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors active:scale-95"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div
        onClick={onOpen}
        className="px-5 pb-3 cursor-pointer"
      >
        <p className="text-[16px] leading-relaxed text-black dark:text-white whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div
          onClick={onOpen}
          className={cn(
            'cursor-pointer overflow-hidden',
            hasMultipleImages ? 'px-5 pb-3' : 'px-5 pb-3'
          )}
        >
          <div className={cn(
            'grid gap-1 rounded-xl overflow-hidden',
            images.length === 1 ? 'grid-cols-1' :
            images.length === 2 ? 'grid-cols-2' :
            images.length === 4 ? 'grid-cols-2' :
            'grid-cols-3'
          )}>
            {images.slice(0, images.length === 4 ? 4 : 9).map((img, i) => (
              <div
                key={i}
                className={cn(
                  'relative overflow-hidden bg-ios-gray5 dark:bg-surface-secondary-dark',
                  images.length === 1 ? 'aspect-[4/3]' :
                  images.length === 2 ? 'aspect-square' :
                  'aspect-square'
                )}
              >
                <Image
                  src={img}
                  alt={`post-image-${i}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                {images.length > 9 && i === 8 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{images.length - 9}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-ios-gray5/80 dark:border-white/5">
        <button
          onClick={() => toggleLike(post.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all active:scale-95',
            post.isLiked ? 'text-ios-red' : 'text-ios-gray2 hover:text-ios-red hover:bg-ios-red/5'
          )}
        >
          <motion.div whileTap={{ scale: 1.3 }} animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart
              size={20}
              strokeWidth={2}
              fill={post.isLiked ? 'currentColor' : 'none'}
            />
          </motion.div>
          <span className="text-[13px] font-medium tabular-nums">
            {formatNumber(post.likesCount)}
          </span>
        </button>

        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-ios-gray2 hover:text-ios-blue hover:bg-ios-blue/5 transition-all active:scale-95"
        >
          <MessageCircle size={20} strokeWidth={2} />
          <span className="text-[13px] font-medium tabular-nums">
            {formatNumber(post.commentsCount)}
          </span>
        </button>

        <button
          onClick={() => toggleBookmark(post.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all active:scale-95',
            post.isBookmarked ? 'text-ios-orange' : 'text-ios-gray2 hover:text-ios-orange hover:bg-ios-orange/5'
          )}
        >
          <Bookmark
            size={20}
            strokeWidth={2}
            fill={post.isBookmarked ? 'currentColor' : 'none'}
          />
          <span className="text-[13px] font-medium tabular-nums">
            {formatNumber(post.bookmarksCount)}
          </span>
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-ios-gray2 hover:text-ios-green hover:bg-ios-green/5 transition-all active:scale-95"
        >
          <Share2 size={20} strokeWidth={2} />
          <span className="text-[13px] font-medium tabular-nums">
            {formatNumber(post.sharesCount)}
          </span>
        </button>
      </div>
    </motion.article>
  );
}
