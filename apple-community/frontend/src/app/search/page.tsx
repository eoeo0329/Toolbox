'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  Hash,
  Users,
  FileText,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { LevelBadge } from '@/components/ui/IconBadge';
import { useApp } from '@/context/AppContext';
import { cn, formatNumber } from '@/lib/utils';
import { mockTopics } from '@/lib/mockData';

type SearchTab = 'all' | 'posts' | 'users' | 'topics';

const recentSearches = ['iOS 设计', 'SwiftUI', '毛玻璃效果', '产品经理'];

const hotSearches = [
  { rank: 1, keyword: 'iOS 18 新特性', hot: true },
  { rank: 2, keyword: 'Vision Pro 体验', hot: true },
  { rank: 3, keyword: 'SwiftUI 动画', hot: false },
  { rank: 4, keyword: '设计模式', hot: true },
  { rank: 5, keyword: '产品思维', hot: false },
  { rank: 6, keyword: '面试经验', hot: false },
  { rank: 7, keyword: 'React 性能优化', hot: false },
  { rank: 8, keyword: '毛玻璃设计', hot: true },
];

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<SearchTab>('all');
  const [searched, setSearched] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { users, posts, topics } = useApp();

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      setSearched(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearched(false);
    inputRef.current?.focus();
  };

  const filteredPosts = React.useMemo(() => {
    if (!query) return [];
    return posts.filter(
      (p) => p.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [posts, query]);

  const filteredUsers = React.useMemo(() => {
    if (!query) return [];
    return users.filter(
      (u) =>
        u.nickname.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.bio.toLowerCase().includes(query.toLowerCase())
    );
  }, [users, query]);

  const filteredTopics = React.useMemo(() => {
    if (!query) return [];
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [topics, query]);

  return (
    <div className="pb-4">
      <NavBar title="发现" largeTitle />

      {/* Search Bar */}
      <div className="px-4 sticky top-[100px] z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-gray2 pointer-events-none">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setSearched(true);
                else setSearched(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索帖子、用户、话题..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-ios-gray5 dark:bg-white/10 text-[15px] text-black dark:text-white placeholder:text-ios-gray outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-ios-gray3 flex items-center justify-center text-white hover:bg-ios-gray transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 h-11 rounded-xl bg-ios-blue text-white text-[15px] font-semibold active:scale-95 transition-transform"
          >
            搜索
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!query && !searched ? (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 space-y-6"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-[15px] font-semibold text-black dark:text-white flex items-center gap-1.5">
                    <Clock size={16} className="text-ios-gray" />
                    最近搜索
                  </h3>
                  <button className="text-[13px] text-ios-blue">清除</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        setQuery(s);
                        setSearched(true);
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-full bg-surface-light dark:bg-surface-dark text-[14px] text-black dark:text-white shadow-ios hover:shadow-ios-lg transition-shadow"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            {/* Hot Searches */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[15px] font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-ios-red" />
                  热搜榜
                  <Sparkles size={14} className="text-ios-orange" />
                </h3>
              </div>
              <Card padding="none" className="overflow-hidden">
                {hotSearches.map((item, i) => (
                  <motion.div
                    key={item.keyword}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setQuery(item.keyword);
                      setSearched(true);
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors',
                      i !== hotSearches.length - 1 && 'border-b border-ios-gray5/80 dark:border-white/5'
                    )}
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0',
                      item.rank === 1 && 'bg-ios-red text-white',
                      item.rank === 2 && 'bg-ios-orange text-white',
                      item.rank === 3 && 'bg-ios-yellow text-white',
                      item.rank > 3 && 'bg-ios-gray5 dark:bg-white/10 text-ios-gray'
                    )}>
                      {item.rank}
                    </span>
                    <span className="text-[15px] text-black dark:text-white flex-1 truncate">
                      {item.keyword}
                    </span>
                    {item.hot && (
                      <span className="px-1.5 py-0.5 rounded bg-ios-red/10 text-ios-red text-[10px] font-bold">
                        HOT
                      </span>
                    )}
                    <ChevronRight size={16} className="text-ios-gray3" />
                  </motion.div>
                ))}
              </Card>
            </section>

            {/* Explore Topics */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[15px] font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <Hash size={16} className="text-ios-purple" />
                  发现话题
                </h3>
                <Link href="/topics" className="text-[13px] text-ios-blue flex items-center">
                  更多
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {mockTopics.slice(0, 4).map((topic, i) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    as={Link}
                    href={`/topic/${topic.id}`}
                  >
                    <Card className="p-4 cursor-pointer hover:shadow-ios-lg transition-all h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash size={18} className="text-ios-purple" />
                        <h4 className="text-[15px] font-bold text-black dark:text-white truncate">
                          {topic.name}
                        </h4>
                      </div>
                      <p className="text-[12px] text-ios-gray line-clamp-2 mb-3">{topic.description}</p>
                      <div className="text-[11px] text-ios-gray">
                        {formatNumber(topic.postsCount)} 讨论 · {formatNumber(topic.followersCount)} 关注
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            {/* Result Tabs */}
            <div className="sticky top-[156px] z-20 -mx-4 px-4 py-2 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
              <div className="flex gap-2 p-1 bg-ios-gray5/60 dark:bg-white/5 rounded-xl overflow-x-auto hide-scrollbar">
                {([
                  { id: 'all', label: '全部', icon: Sparkles, count: filteredPosts.length + filteredUsers.length + filteredTopics.length },
                  { id: 'posts', label: '帖子', icon: FileText, count: filteredPosts.length },
                  { id: 'users', label: '用户', icon: Users, count: filteredUsers.length },
                  { id: 'topics', label: '话题', icon: Hash, count: filteredTopics.length },
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0',
                        isActive
                          ? 'bg-surface-light dark:bg-surface-dark text-black dark:text-white shadow-sm'
                          : 'text-ios-gray hover:text-black dark:hover:text-white'
                      )}
                    >
                      <Icon size={15} />
                      {tab.label}
                      <span className={cn(
                        'px-1.5 py-0.5 rounded-full text-[11px]',
                        isActive ? 'bg-ios-gray5 dark:bg-white/10' : 'bg-black/5 dark:bg-white/10'
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {(activeTab === 'all' || activeTab === 'users') && filteredUsers.length > 0 && (
                <section>
                  <SectionHeader title="用户" count={filteredUsers.length} icon={Users} />
                  <Card padding="none" className="overflow-hidden">
                    {filteredUsers.slice(0, activeTab === 'all' ? 3 : undefined).map((user, i, arr) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors',
                          i !== arr.length - 1 && 'border-b border-ios-gray5/80 dark:border-white/5'
                        )}
                      >
                        <Avatar src={user.avatar} size={48} fallback={user.nickname.charAt(0)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-semibold text-black dark:text-white truncate">
                              {user.nickname}
                            </span>
                            <LevelBadge level={user.level} size="sm" />
                          </div>
                          <p className="text-[12px] text-ios-gray truncate mt-0.5">{user.bio}</p>
                          <p className="text-[11px] text-ios-gray3 mt-0.5">
                            {formatNumber(user.followersCount)} 粉丝 · {user.postsCount} 帖子
                          </p>
                        </div>
                        <button className="px-4 py-1.5 rounded-full bg-ios-blue/10 text-ios-blue text-[13px] font-semibold active:scale-95 transition-transform">
                          关注
                        </button>
                      </Link>
                    ))}
                  </Card>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'topics') && filteredTopics.length > 0 && (
                <section>
                  <SectionHeader title="话题" count={filteredTopics.length} icon={Hash} />
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTopics.slice(0, activeTab === 'all' ? 4 : undefined).map((topic) => (
                      <Link key={topic.id} href={`/topic/${topic.id}`}>
                        <Card className="p-4 cursor-pointer hover:shadow-ios-lg transition-all h-full">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Hash size={16} className="text-ios-purple" />
                            <h4 className="text-[15px] font-bold text-black dark:text-white truncate">{topic.name}</h4>
                          </div>
                          <p className="text-[12px] text-ios-gray line-clamp-2">{topic.description}</p>
                          <div className="mt-2 text-[11px] text-ios-gray">
                            {formatNumber(topic.postsCount)} 讨论
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'posts') && filteredPosts.length > 0 && (
                <section>
                  <SectionHeader title="帖子" count={filteredPosts.length} icon={FileText} />
                  <p className="text-[13px] text-ios-gray px-1 mt-2">
                    搜索到 {filteredPosts.length} 条相关帖子
                  </p>
                </section>
              )}

              {filteredPosts.length === 0 && filteredUsers.length === 0 && filteredTopics.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-ios-gray5 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Search size={36} className="text-ios-gray3" />
                  </div>
                  <p className="text-[15px] text-ios-gray font-medium mb-1">
                    没有找到 "{query}" 的相关结果
                  </p>
                  <p className="text-[13px] text-ios-gray3">
                    试试其他关键词，或检查拼写是否正确
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ title, count, icon: Icon }: { title: string; count: number; icon: any }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1 mt-4 first:mt-0">
      <h3 className="text-[15px] font-semibold text-black dark:text-white flex items-center gap-1.5">
        <Icon size={16} className="text-ios-blue" />
        {title}
      </h3>
      <span className="text-[13px] text-ios-gray">{count} 个结果</span>
    </div>
  );
}
