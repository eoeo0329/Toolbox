'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronLeft,
  MoreHorizontal,
  Send,
  Smile,
  Image as ImageIcon,
  Flame,
  Pin,
  Eye,
} from 'lucide-react';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { LevelBadge } from '@/components/ui/IconBadge';
import { useApp } from '@/context/AppContext';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { mockComments } from '@/lib/mockData';
import type { Comment } from '@/types';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const { posts, users, topics, toggleLike, toggleBookmark } = useApp();
  const [showComments, setShowComments] = React.useState(true);
  const [commentText, setCommentText] = React.useState('');
  const [comments, setComments] = React.useState<Comment[]>(mockComments);

  const post = posts.find((p) => p.id === postId) || posts[0];
  const author = users.find((u) => u.id === post.authorId);
  const topic = topics.find((t) => t.id === post.topicId);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: post.id,
      authorId: '1',
      content: commentText,
      likesCount: 0,
      replies: [],
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const toggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 };
        }
        if (c.replies?.length) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? { ...r, isLiked: !r.isLiked, likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1 }
                : r
            ),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-background-dark min-h-screen">
      {/* Custom Nav Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 safe-area-top nav-blur bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/10"
      >
        <div className="h-11 px-4 flex items-center justify-between relative max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center -ml-2 px-2 py-1 rounded-full text-ios-blue hover:bg-ios-blue/10 active:bg-ios-blue/20 transition-colors"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {author && <Avatar src={author.avatar} size={28} fallback={author.nickname?.charAt(0)} />}
            <span className="text-[15px] font-semibold text-black dark:text-white max-w-[120px] truncate">
              {author?.nickname}
            </span>
          </div>
          <button className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
            <MoreHorizontal size={22} />
          </button>
        </div>
      </motion.div>
      <div className="safe-area-top h-[44px]" />

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-4"
      >
        {/* Author Header */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={author ? `/profile/${author.id}` : '/profile'} className="shrink-0">
            <Avatar src={author?.avatar} size={52} fallback={author?.nickname?.charAt(0)} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] font-semibold text-black dark:text-white">
                {author?.nickname}
              </span>
              {author && <LevelBadge level={author.level} size="sm" />}
              {author?.isVerified && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ios-blue text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[13px] text-ios-gray">{formatDate(post.createdAt)}</span>
              <span className="text-ios-gray4">·</span>
              <Eye size={12} className="text-ios-gray3" />
              <span className="text-[13px] text-ios-gray">{formatNumber(post.viewsCount)} 阅读</span>
              {post.isPinned && <Pin size={12} className="text-ios-orange fill-ios-orange" />}
              {post.isHot && <Flame size={12} className="text-ios-red fill-ios-red" />}
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-full bg-ios-blue text-white text-[13px] font-semibold active:scale-95 transition-transform">
            {author?.isFollowing ? '已关注' : '+ 关注'}
          </button>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[17px] leading-relaxed text-black dark:text-white whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Topic */}
          {topic && (
            <Link
              href={`/topic/${topic.id}`}
              className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full bg-ios-purple/10 text-ios-purple text-[13px] font-medium hover:bg-ios-purple/20 transition-colors"
            >
              <span className="font-bold">#</span>
              {topic.name}
            </Link>
          )}

          {/* Images */}
          {post.images.length > 0 && (
            <div className={cn(
              'mt-4 grid gap-1.5 rounded-2xl overflow-hidden',
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 4 ? 'grid-cols-2' :
              'grid-cols-3'
            )}>
              {post.images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={cn(
                    'relative overflow-hidden bg-ios-gray5 dark:bg-surface-secondary-dark',
                    post.images.length === 1 ? 'aspect-[4/3]' : 'aspect-square'
                  )}
                >
                  <Image
                    src={img}
                    alt={`post-image-${i}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-ios-gray5/80 dark:border-white/10 text-[13px] text-ios-gray">
            <span>{formatNumber(post.viewsCount)} 阅读</span>
            <span>{formatNumber(post.commentsCount)} 评论</span>
            <span>{formatNumber(post.sharesCount)} 转发</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Action Bar (Sticky) */}
      <div className="sticky top-[44px] z-30 bg-background-light/85 dark:bg-background-dark/85 backdrop-blur-xl border-b border-ios-gray5/80 dark:border-white/5">
        <div className="flex items-center justify-around py-2.5 px-2">
          {[
            { icon: Heart, label: '点赞', value: post.likesCount, active: post.isLiked, activeColor: 'text-ios-red', onClick: () => toggleLike(post.id), fillOnActive: true },
            { icon: MessageCircle, label: '评论', value: post.commentsCount, active: showComments, activeColor: 'text-ios-blue', onClick: () => setShowComments(!showComments) },
            { icon: Bookmark, label: '收藏', value: post.bookmarksCount, active: post.isBookmarked, activeColor: 'text-ios-orange', onClick: () => toggleBookmark(post.id), fillOnActive: true },
            { icon: Share2, label: '分享', value: post.sharesCount, active: false, activeColor: 'text-ios-green', onClick: () => console.log('share') },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.9 }}
                onClick={action.onClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-ios-gray5/60 dark:hover:bg-white/5 transition-colors"
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className={cn(
                    'transition-colors',
                    action.active ? action.activeColor : 'text-ios-gray2'
                  )}
                  fill={action.active && action.fillOnActive ? 'currentColor' : 'none'}
                />
                <span className={cn(
                  'text-[13px] font-medium tabular-nums',
                  action.active ? action.activeColor : 'text-black dark:text-white'
                )}>
                  {formatNumber(action.value)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 pt-4"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[17px] font-bold text-black dark:text-white">
                评论 {comments.length > 0 && <span className="text-ios-gray">({comments.length})</span>}
              </h3>
              <div className="flex items-center gap-1 text-[13px] text-ios-gray">
                最热
                <ChevronLeft size={14} className="rotate-[-90deg]" />
              </div>
            </div>

            <Card padding="none" className="overflow-hidden">
              {comments.map((comment, idx) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  index={idx}
                  onLike={() => toggleCommentLike(comment.id)}
                  isLast={idx === comments.length - 1}
                />
              ))}
            </Card>

            {/* End hint */}
            <div className="text-center py-6 text-[12px] text-ios-gray3">
              — 没有更多评论了，发表第一条吧 —
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Comment Input */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
      >
        <div className="mx-auto max-w-2xl nav-blur bg-white/90 dark:bg-black/90 border-t border-black/5 dark:border-white/10">
          <div className="px-3 py-2.5 flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors text-ios-gray2 shrink-0">
              <ImageIcon size={22} />
            </button>
            <div className="flex-1 relative">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                type="text"
                placeholder="写下你的评论..."
                className="w-full h-10 pl-4 pr-10 rounded-full bg-ios-gray5 dark:bg-white/10 text-[15px] text-black dark:text-white placeholder:text-ios-gray2 outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-ios-gray2 hover:text-ios-yellow transition-colors">
                <Smile size={18} />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                commentText.trim()
                  ? 'bg-ios-blue text-white'
                  : 'bg-ios-gray5 dark:bg-white/10 text-ios-gray3'
              )}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CommentItem({
  comment,
  index,
  onLike,
  isLast,
}: {
  comment: Comment;
  index: number;
  onLike: () => void;
  isLast: boolean;
}) {
  const { users } = useApp();
  const author = users.find((u) => u.id === comment.authorId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 hover:bg-ios-gray5/30 dark:hover:bg-white/5 transition-colors',
        !isLast && 'border-b border-ios-gray5/60 dark:border-white/5'
      )}
    >
      <Link href={author ? `/profile/${author.id}` : '/profile'} className="shrink-0">
        <Avatar src={author?.avatar} size={40} fallback={author?.nickname?.charAt(0)} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[14px] font-semibold text-ios-gray truncate">
            {author?.nickname}
          </span>
          {author && <LevelBadge level={author.level} size="sm" />}
        </div>
        <p className="text-[15px] text-black dark:text-white mt-1 leading-relaxed break-words">
          {comment.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-[12px] text-ios-gray">
          <span>{formatDate(comment.createdAt)}</span>
          <button className="hover:text-ios-blue transition-colors">
            回复
          </button>
          <button
            onClick={onLike}
            className={cn(
              'flex items-center gap-1 hover:text-ios-red transition-colors',
              comment.isLiked && 'text-ios-red'
            )}
          >
            <Heart
              size={13}
              fill={comment.isLiked ? 'currentColor' : 'none'}
            />
            {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
          </button>
        </div>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-3 pl-3 border-l-2 border-ios-gray5 dark:border-white/10 space-y-3">
            {comment.replies.map((reply) => {
              const replyAuthor = users.find((u) => u.id === reply.authorId);
              return (
                <div key={reply.id} className="flex items-start gap-2">
                  <Avatar src={replyAuthor?.avatar} size={28} fallback={replyAuthor?.nickname?.charAt(0)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-ios-gray">
                        {replyAuthor?.nickname}
                      </span>
                    </div>
                    <p className="text-[14px] text-black dark:text-white mt-0.5 break-words">
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ios-gray">
                      <span>{formatDate(reply.createdAt)}</span>
                      <button
                        onClick={() => onLike()}
                        className={cn(
                          'flex items-center gap-1 hover:text-ios-red',
                          reply.isLiked && 'text-ios-red'
                        )}
                      >
                        <Heart size={11} fill={reply.isLiked ? 'currentColor' : 'none'} />
                        {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
