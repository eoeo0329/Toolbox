'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings,
  Shield,
  FileText,
  Heart,
  Bookmark,
  MessageSquare,
  Eye,
  Edit,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Crown,
  Star,
  Award,
  TrendingUp,
  CalendarDays,
  Hash,
} from 'lucide-react';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ListItem, ListGroup } from '@/components/ui/ListItem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LevelBadge } from '@/components/ui/IconBadge';
import { useApp } from '@/context/AppContext';
import { cn, formatNumber, getLevelProgress } from '@/lib/utils';
import { PostCard } from '@/components/ui/PostCard';

type ProfileTab = 'posts' | 'likes' | 'bookmarks';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, posts, settings } = useApp();
  const [activeTab, setActiveTab] = React.useState<ProfileTab>('posts');
  const [copied, setCopied] = React.useState(false);

  const handleCopyUID = async () => {
    if (currentUser?.uid) {
      await navigator.clipboard.writeText(currentUser.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const myPosts = React.useMemo(() => {
    return posts.filter((p) => p.authorId === currentUser?.id);
  }, [posts, currentUser]);

  const likedPosts = React.useMemo(() => {
    return posts.filter((p) => p.isLiked);
  }, [posts]);

  const bookmarkedPosts = React.useMemo(() => {
    return posts.filter((p) => p.isBookmarked);
  }, [posts]);

  const displayedPosts =
    activeTab === 'posts' ? myPosts : activeTab === 'likes' ? likedPosts : bookmarkedPosts;

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } },
  };

  return (
    <div className="pb-4">
      <NavBar
        title="我的"
        largeTitle
        rightContent={
          <Link
            href="/settings"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors text-ios-blue"
          >
            <Settings size={22} strokeWidth={2} />
          </Link>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-0"
      >
        {/* User Profile Header Card - iOS Settings style */}
        <motion.div variants={item} className="px-4 mb-2">
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="relative p-5">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-ios-purple/5 to-ios-pink/5 pointer-events-none" />
              
              <div className="relative flex items-start gap-4">
                <div className="relative">
                  <Avatar src={currentUser?.avatar} size={72} fallback={currentUser?.nickname?.charAt(0)} ring />
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ios-blue text-white border-2 border-white dark:border-surface-dark flex items-center justify-center shadow-ios active:scale-95 transition-transform"
                  >
                    <Edit size={12} />
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[22px] font-bold text-black dark:text-white truncate">
                      {currentUser?.nickname}
                    </h2>
                    {currentUser && <LevelBadge level={currentUser.level} />}
                    {currentUser?.isVerified && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ios-blue text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[13px] text-ios-gray font-mono bg-ios-gray5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                      {currentUser?.uid}
                    </span>
                    <button
                      onClick={handleCopyUID}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-ios-gray hover:text-ios-blue hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors"
                    >
                      {copied ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={14} className="text-ios-green" />
                        </motion.div>
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-[14px] text-black/80 dark:text-white/80 mt-2 leading-relaxed line-clamp-2">
                    {currentUser?.bio}
                  </p>
                </div>
              </div>

              {/* Level Progress */}
              {currentUser && (
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-ios-blue/10 to-ios-purple/10 dark:from-ios-blue/20 dark:to-ios-purple/20 border border-ios-blue/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown size={16} className="text-ios-orange" fill="currentColor" />
                      <span className="text-[14px] font-semibold text-black dark:text-white">
                        等级 {currentUser.level}
                      </span>
                    </div>
                    <span className="text-[12px] text-ios-gray">
                      距离 Lv{currentUser.level + 1} 还需 {formatNumber((currentUser.level + 1) ** 2 * 100 - currentUser.points)} 经验
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60 dark:bg-black/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getLevelProgress(currentUser.points) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-ios-blue via-ios-purple to-ios-pink"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[12px] text-ios-gray">
                    <span>当前经验: {formatNumber(currentUser.points)}</span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-ios-yellow" fill="currentColor" />
                      积分: {formatNumber(currentUser.points * 10)}
                    </span>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-ios-gray5/80 dark:border-white/10">
                {[
                  { label: '帖子', value: currentUser?.postsCount ?? 0, icon: FileText, color: 'text-ios-blue', bg: 'bg-ios-blue/10' },
                  { label: '粉丝', value: currentUser?.followersCount ?? 0, icon: Award, color: 'text-ios-purple', bg: 'bg-ios-purple/10' },
                  { label: '关注', value: currentUser?.followingCount ?? 0, icon: TrendingUp, color: 'text-ios-green', bg: 'bg-ios-green/10' },
                  { label: '积分数', value: (currentUser?.points ?? 0) * 10, icon: Sparkles, color: 'text-ios-orange', bg: 'bg-ios-orange/10' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      whileHover={{ y: -2 }}
                      className="flex flex-col items-center p-2 rounded-xl hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-1.5', s.bg)}>
                        <Icon size={18} className={s.color} />
                      </div>
                      <span className={cn('text-[17px] font-bold tabular-nums', s.color)}>
                        {formatNumber(s.value)}
                      </span>
                      <span className="text-[11px] text-ios-gray mt-0.5">{s.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="md" className="flex-1">
                  <Edit size={16} className="mr-1.5" />
                  编辑资料
                </Button>
                <Button variant="primary" size="md" className="flex-1">
                  <Eye size={16} className="mr-1.5" />
                  预览主页
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Menu Groups - iOS Settings Style */}
        <motion.div variants={item}>
          <ListGroup title="内容管理">
            <ListItem
              icon={FileText}
              iconBg="blue"
              title="我的帖子"
              subtitle={`发布了 ${myPosts.length} 条内容`}
              value={myPosts.length}
              onClick={() => setActiveTab('posts')}
            />
            <ListItem
              icon={Heart}
              iconBg="red"
              title="我的点赞"
              subtitle={`点赞了 ${likedPosts.length} 条内容`}
              value={likedPosts.length}
              onClick={() => setActiveTab('likes')}
            />
            <ListItem
              icon={Bookmark}
              iconBg="orange"
              title="我的收藏"
              subtitle={`收藏了 ${bookmarkedPosts.length} 条内容`}
              value={bookmarkedPosts.length}
              onClick={() => setActiveTab('bookmarks')}
            />
            <ListItem
              icon={MessageSquare}
              iconBg="green"
              title="我的评论"
              subtitle="查看所有评论历史"
            />
          </ListGroup>
        </motion.div>

        <motion.div variants={item}>
          <ListGroup title="账号与服务">
            <ListItem
              icon={Settings}
              iconBg="gray"
              title="设置"
              subtitle="通用设置与偏好"
              onClick={() => router.push('/settings')}
            />
            <ListItem
              icon={Shield}
              iconBg="blue"
              title="隐私与安全"
              subtitle="管理隐私权限"
              onClick={() => router.push('/settings?tab=privacy')}
            />
            <ListItem
              icon={CalendarDays}
              iconBg="purple"
              title="签到记录"
              subtitle="连续签到 12 天"
              value="12天"
            />
          </ListGroup>
        </motion.div>

        {/* Content Tabs */}
        <motion.div variants={item} className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[19px] font-bold text-black dark:text-white">
              {activeTab === 'posts' && '我的帖子'}
              {activeTab === 'likes' && '我的点赞'}
              {activeTab === 'bookmarks' && '我的收藏'}
            </h3>
            <span className="text-[14px] text-ios-gray">共 {displayedPosts.length} 条</span>
          </div>

          {/* Tab Pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
            {([
              { id: 'posts', label: '帖子', count: myPosts.length, icon: FileText },
              { id: 'likes', label: '点赞', count: likedPosts.length, icon: Heart },
              { id: 'bookmarks', label: '收藏', count: bookmarkedPosts.length, icon: Bookmark },
            ] as const).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all duration-200',
                    isActive
                      ? 'bg-ios-blue text-white shadow-ios'
                      : 'bg-ios-gray5 dark:bg-white/5 text-ios-gray hover:text-black dark:hover:text-white'
                  )}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-[11px]',
                    isActive ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content List */}
          {displayedPosts.length === 0 ? (
            <Card className="py-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-ios-gray5 dark:bg-white/10 flex items-center justify-center">
                  {activeTab === 'posts' && <FileText size={36} className="text-ios-gray3" />}
                  {activeTab === 'likes' && <Heart size={36} className="text-ios-gray3" />}
                  {activeTab === 'bookmarks' && <Bookmark size={36} className="text-ios-gray3" />}
                </div>
                <p className="text-[15px] text-ios-gray font-medium">
                  {activeTab === 'posts' && '还没有发布帖子'}
                  {activeTab === 'likes' && '还没有点赞内容'}
                  {activeTab === 'bookmarks' && '还没有收藏内容'}
                </p>
                <p className="text-[13px] text-ios-gray3">
                  {activeTab === 'posts' && '去发布你的第一条动态吧～'}
                  {activeTab === 'likes' && '逛逛社区，发现感兴趣的内容'}
                  {activeTab === 'bookmarks' && '收藏好内容，随时查阅'}
                </p>
                <Button variant="primary" size="sm" className="mt-2">
                  {activeTab === 'posts' ? '去发布' : '去发现'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer spacing */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
