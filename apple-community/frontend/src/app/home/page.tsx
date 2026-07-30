'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search as SearchIcon,
  Flame,
  Clock,
  Users,
  Hash,
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/ui/PostCard';
import { LevelBadge } from '@/components/ui/IconBadge';
import { Skeleton, SkeletonPost } from '@/components/ui/Skeleton';
import { useApp } from '@/context/AppContext';
import { cn, formatNumber, getLevelProgress } from '@/lib/utils';
import { mockEvents } from '@/lib/mockData';
import type { Topic, CommunityEvent } from '@/types';

type FeedTab = 'hot' | 'latest' | 'following';

export default function HomePage() {
  const { currentUser, posts, topics, users, unreadNotificationsCount } = useApp();
  const [activeTab, setActiveTab] = React.useState<FeedTab>('hot');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const filteredPosts = React.useMemo(() => {
    switch (activeTab) {
      case 'hot':
        return [...posts].sort((a, b) => (b.likesCount + b.commentsCount * 2) - (a.likesCount + a.commentsCount * 2));
      case 'latest':
        return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'following':
        return posts.filter((p) => {
          const author = users.find((u) => u.id === p.authorId);
          return author?.isFollowing;
        });
      default:
        return posts;
    }
  }, [activeTab, posts, users]);

  const recommendedUsers = React.useMemo(() => {
    return users.filter((u) => !u.isFollowing).slice(0, 4);
  }, [users]);

  return (
    <div className="pb-4">
      <NavBar
        title="社区大厅"
        largeTitle
        rightContent={
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors text-ios-blue"
            >
              <SearchIcon size={22} strokeWidth={2} />
            </Link>
            <Link
              href="/messages"
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors text-ios-blue"
            >
              <Bell size={22} strokeWidth={2} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ios-red text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-black">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </Link>
          </div>
        }
      />

      {/* User Hero Card */}
      <section className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" padding="none" className="overflow-hidden relative">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/10 via-ios-purple/10 to-ios-pink/10 dark:from-ios-blue/20 dark:via-ios-purple/20 dark:to-ios-pink/20" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-ios-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-ios-purple/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative p-5">
              <div className="flex items-start gap-4">
                <Link href="/profile" className="shrink-0">
                  <div className="relative">
                    <Avatar src={currentUser?.avatar} size={64} fallback={currentUser?.nickname?.charAt(0)} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ios-green border-2 border-white dark:border-surface-dark flex items-center justify-center">
                      <Sparkles size={10} className="text-white" fill="currentColor" />
                    </div>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[22px] font-bold text-black dark:text-white truncate">
                      {currentUser?.nickname || '欢迎回来'}
                    </h2>
                    {currentUser && <LevelBadge level={currentUser.level} size="md" />}
                    {currentUser?.isVerified && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ios-blue text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-ios-gray mt-0.5 line-clamp-1">
                    {currentUser?.bio || '开始探索社区吧～'}
                  </p>

                  {/* Level progress */}
                  {currentUser && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <span className="text-ios-gray">
                          经验值 <span className="text-ios-blue font-semibold">{formatNumber(currentUser.points)}</span>
                        </span>
                        <span className="text-ios-gray">
                          下一级 <span className="text-ios-blue font-semibold">{formatNumber((currentUser.level + 1) ** 2 * 100)}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-ios-gray5 dark:bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getLevelProgress(currentUser.points) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-ios-blue to-ios-purple"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-ios-gray5/80 dark:border-white/10">
                {[
                  { label: '发帖', value: currentUser?.postsCount ?? 0, color: 'text-ios-blue' },
                  { label: '粉丝', value: currentUser?.followersCount ?? 0, color: 'text-ios-purple' },
                  { label: '关注', value: currentUser?.followingCount ?? 0, color: 'text-ios-green' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <span className={cn('text-[22px] font-bold tabular-nums', stat.color)}>
                      {formatNumber(stat.value)}
                    </span>
                    <span className="text-[12px] text-ios-gray mt-0.5">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: '排行榜', color: 'bg-ios-yellow', href: '/leaderboard' },
            { icon: Calendar, label: '活动', color: 'bg-ios-orange', href: '/events' },
            { icon: Users, label: '找人', color: 'bg-ios-green', href: '/search' },
            { icon: Zap, label: '签到', color: 'bg-ios-red', href: '/checkin' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                as={Link}
                href={item.href}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-ios', item.color)}>
                  <Icon size={26} strokeWidth={2} />
                </div>
                <span className="text-[12px] text-black dark:text-white font-medium">{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Community Events */}
      <section className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[17px] font-bold text-black dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-ios-orange" />
              社区活动
            </h3>
            <Link href="/events" className="text-[14px] text-ios-blue flex items-center">
              查看全部
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory">
            {mockEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Topics */}
      <section className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[17px] font-bold text-black dark:text-white flex items-center gap-2">
              <Hash size={18} className="text-ios-purple" />
              热门话题
            </h3>
            <Link href="/topics" className="text-[14px] text-ios-blue flex items-center">
              更多
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory">
            {topics.slice(0, 6).map((topic, i) => (
              <TopicChip key={topic.id} topic={topic} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Recommended Users */}
      <section className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[17px] font-bold text-black dark:text-white flex items-center gap-2">
              <Users size={18} className="text-ios-green" />
              推荐用户
            </h3>
            <Link href="/discover" className="text-[14px] text-ios-blue flex items-center">
              换一批
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory">
            {recommendedUsers.map((user, i) => (
              <UserCard key={user.id} user={user} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feed Tabs */}
      <section className="sticky top-[100px] z-40 px-4 mb-3 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md pt-3 -mt-1">
        <div className="flex gap-2 p-1 bg-ios-gray5/60 dark:bg-white/5 rounded-ios">
          {([
            { id: 'hot', label: '热门', icon: Flame },
            { id: 'latest', label: '最新', icon: Clock },
            { id: 'following', label: '关注', icon: Users },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[14px] font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-surface-light dark:bg-surface-dark text-black dark:text-white shadow-sm'
                    : 'text-ios-gray hover:text-black dark:hover:text-white'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-10 rounded-xl text-ios-blue hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
          >
            <RefreshCw
              size={18}
              className={cn(refreshing && 'animate-spin')}
            />
          </button>
        </div>
      </section>

      {/* Posts Feed */}
      <section className="px-4 space-y-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <SkeletonPost key={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {refreshing && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-ios-gray text-sm">
                    <RefreshCw size={16} className="animate-spin" />
                    正在刷新...
                  </div>
                </div>
              )}
              {filteredPosts.length === 0 ? (
                <Card className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-ios-gray5 dark:bg-white/10 flex items-center justify-center">
                      <Clock size={32} className="text-ios-gray3" />
                    </div>
                    <p className="text-[15px] text-ios-gray">还没有内容，快去关注一些人吧～</p>
                    <Button variant="primary" size="sm" className="mt-2">
                      去发现
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
              {/* End of feed */}
              <div className="py-8 text-center">
                <p className="text-[13px] text-ios-gray3">
                  — 你已经到达世界的尽头 —
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function EventCard({ event, index }: { event: CommunityEvent; index: number }) {
  const { toggleFollow } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="snap-start shrink-0 w-[280px]"
    >
      <Card variant="elevated" padding="none" className="overflow-hidden h-full cursor-pointer group" interactive>
        <div className="relative h-32 overflow-hidden">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="280px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold text-black">
              {event.maxParticipants ? `限${event.maxParticipants}人` : '活动进行中'}
            </span>
            {event.isJoined && (
              <span className="px-2.5 py-1 rounded-full bg-ios-green text-[11px] font-bold text-white">
                已报名
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h4 className="text-[16px] font-bold text-black dark:text-white line-clamp-1">
            {event.title}
          </h4>
          <p className="text-[13px] text-ios-gray line-clamp-2 mt-1">
            {event.description}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-ios-gray5/80 dark:border-white/10">
            <div className="flex items-center gap-1 text-[12px] text-ios-gray">
              <Users size={14} />
              {formatNumber(event.participantsCount)} 人参加
            </div>
            <Button
              size="sm"
              variant={event.isJoined ? 'secondary' : 'primary'}
              onClick={() => toggleFollow(event.id)}
            >
              {event.isJoined ? '已报名' : '立即参加'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function TopicChip({ topic, index }: { topic: Topic; index: number }) {
  const iconMap: Record<string, any> = {
    palette: Hash,
    smartphone: Hash,
    lightbulb: Hash,
    'trending-up': Hash,
    camera: Hash,
    zap: Hash,
  };
  const colorMap: Record<string, string> = {
    'ios-purple': 'bg-ios-purple',
    'ios-blue': 'bg-ios-blue',
    'ios-yellow': 'bg-ios-yellow',
    'ios-green': 'bg-ios-green',
    'ios-pink': 'bg-ios-pink',
    'ios-orange': 'bg-ios-orange',
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * index }}
      className="snap-start shrink-0"
      whileTap={{ scale: 0.95 }}
      as={Link}
      href={`/topic/${topic.id}`}
    >
      <Card className="p-4 w-[180px] cursor-pointer hover:shadow-ios-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white', colorMap[topic.color] || 'bg-ios-blue')}>
            <Hash size={18} />
          </div>
          <h4 className="text-[15px] font-bold text-black dark:text-white">{topic.name}</h4>
        </div>
        <p className="text-[12px] text-ios-gray line-clamp-1 mb-2">{topic.description}</p>
        <div className="flex items-center justify-between text-[11px] text-ios-gray">
          <span>{formatNumber(topic.postsCount)} 讨论</span>
          {topic.isFollowing && (
            <span className="text-ios-blue font-medium">已关注</span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function UserCard({ user, index }: { user: import('@/types').User; index: number }) {
  const { toggleFollow } = useApp();
  const [following, setFollowing] = React.useState(user.isFollowing);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * index }}
      className="snap-start shrink-0 w-[150px]"
    >
      <Card className="p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-ios-lg transition-shadow" interactive>
        <Link href={`/profile/${user.id}`} className="w-full">
          <div className="relative mb-3">
            <Avatar src={user.avatar} size={56} fallback={user.nickname.charAt(0)} ring />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ios-blue border-2 border-white dark:border-surface-dark flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>
          <h4 className="text-[15px] font-bold text-black dark:text-white truncate w-full">
            {user.nickname}
          </h4>
          <div className="flex items-center justify-center gap-1 mt-0.5 mb-1">
            <LevelBadge level={user.level} size="sm" />
          </div>
          <p className="text-[11px] text-ios-gray line-clamp-2 h-[30px]">{user.bio}</p>
          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-ios-gray">
            <span>{formatNumber(user.followersCount)} 粉丝</span>
          </div>
        </Link>
        <Button
          size="sm"
          variant={following ? 'secondary' : 'primary'}
          className="w-full mt-3"
          onClick={() => {
            setFollowing(!following);
            toggleFollow(user.id);
          }}
        >
          {following ? '已关注' : '关注'}
        </Button>
      </Card>
    </motion.div>
  );
}
