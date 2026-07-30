'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  ChevronRight,
  Search,
  Users2,
  Bot,
  Pin,
  Volume2,
} from 'lucide-react';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';
import { mockUsers } from '@/lib/mockData';

const mockConversations = [
  {
    id: '1',
    user: mockUsers[0],
    lastMessage: '那个设置页面的代码我稍后发给你！',
    time: '2分钟前',
    unread: 2,
    isPinned: true,
    isMuted: false,
    isGroup: false,
  },
  {
    id: '2',
    user: mockUsers[1],
    lastMessage: '你报名了设计挑战赛吗？',
    time: '10分钟前',
    unread: 1,
    isPinned: true,
    isMuted: false,
    isGroup: false,
  },
  {
    id: '3',
    user: { ...mockUsers[2], nickname: 'iOS开发交流群', avatar: 'https://i.pravatar.cc/150?img=50' },
    lastMessage: '小王：有大佬分享一下 SwiftData 的经验吗',
    time: '1小时前',
    unread: 12,
    isPinned: false,
    isMuted: true,
    isGroup: true,
    groupCount: 256,
  },
  {
    id: '4',
    user: mockUsers[3],
    lastMessage: '好的，那就这么定了！周末见～',
    time: '2小时前',
    unread: 0,
    isPinned: false,
    isMuted: false,
    isGroup: false,
  },
  {
    id: '5',
    user: { ...mockUsers[4], nickname: '官方小助手', avatar: 'https://i.pravatar.cc/150?img=68' },
    lastMessage: '您的账号已完成实名认证 ✅',
    time: '昨天',
    unread: 0,
    isPinned: false,
    isMuted: false,
    isGroup: false,
    isOfficial: true,
  },
];

export default function MessagesPage() {
  const { conversations } = useApp();

  const pinned = mockConversations.filter((c) => c.isPinned);
  const regular = mockConversations.filter((c) => !c.isPinned);

  const totalUnread = mockConversations.reduce((sum, c) => sum + c.unread, 0);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.04, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300 } },
  };

  return (
    <div className="pb-4">
      <NavBar
        title="消息"
        largeTitle
        rightContent={
          <Link
            href="/search"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-ios-gray5 dark:hover:bg-white/10 transition-colors text-ios-blue"
          >
            <Search size={22} strokeWidth={2} />
          </Link>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Summary */}
        <motion.div variants={item} className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 cursor-pointer hover:shadow-ios-lg transition-shadow" interactive>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-ios-blue/10 flex items-center justify-center">
                  <Users2 size={22} className="text-ios-blue" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-black dark:text-white">新朋友</div>
                  <div className="text-[12px] text-ios-gray">3 条验证消息</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 cursor-pointer hover:shadow-ios-lg transition-shadow" interactive>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ios-purple to-ios-pink flex items-center justify-center">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-black dark:text-white">AI 助手</div>
                  <div className="text-[12px] text-ios-gray">随时为你解答</div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Filter Pills */}
        <motion.div variants={item} className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
            {[
              { label: '全部消息', count: totalUnread, active: true },
              { label: '未读', count: totalUnread, active: false },
              { label: '@我', count: 2, active: false },
              { label: '评论回复', count: 5, active: false },
            ].map((pill, i) => (
              <button
                key={pill.label}
                className={
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all shrink-0 ' +
                  (pill.active
                    ? 'bg-ios-blue text-white shadow-ios'
                    : 'bg-surface-light dark:bg-surface-dark text-ios-gray shadow-ios hover:text-black dark:hover:text-white')
                }
              >
                {pill.label}
                {pill.count > 0 && (
                  <span className={
                    'px-1.5 py-0.5 rounded-full text-[11px] font-bold ' +
                    (pill.active ? 'bg-white/20' : 'bg-ios-red text-white')
                  }>
                    {pill.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <motion.div variants={item} className="px-4 mb-2">
            <div className="px-1 mb-2 text-[13px] font-semibold text-ios-gray flex items-center gap-1.5 uppercase tracking-wide">
              <Pin size={12} className="text-ios-orange" />
              置顶
            </div>
            <Card padding="none" className="overflow-hidden">
              {pinned.map((conv, i) => (
                <ConversationItem key={conv.id} conv={conv} isLast={i === pinned.length - 1} />
              ))}
            </Card>
          </motion.div>
        )}

        {/* Regular */}
        <motion.div variants={item} className="px-4">
          <div className="px-1 mb-2 text-[13px] font-semibold text-ios-gray uppercase tracking-wide">
            会话
          </div>
          <Card padding="none" className="overflow-hidden">
            {regular.map((conv, i) => (
              <ConversationItem key={conv.id} conv={conv} isLast={i === regular.length - 1} />
            ))}
          </Card>
        </motion.div>

        {/* Empty state hint */}
        <motion.div variants={item} className="text-center py-10 px-4">
          <p className="text-[13px] text-ios-gray3">
            点击右上角 ＋ 开启新的对话
          </p>
        </motion.div>

        <div className="h-4" />
      </motion.div>
    </div>
  );
}

function ConversationItem({ conv, isLast }: { conv: any; isLast: boolean }) {
  return (
    <Link
      href={`/messages/${conv.id}`}
      className={
        'flex items-start gap-3 px-4 py-3.5 hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors active:bg-ios-gray5 dark:active:bg-white/5 ' +
        (!isLast ? 'border-b border-ios-gray5/80 dark:border-white/5' : '')
      }
    >
      <div className="relative shrink-0">
        <Avatar src={conv.user.avatar} size={52} fallback={conv.user.nickname?.charAt(0)} />
        {conv.isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ios-gray border-2 border-white dark:border-surface-dark flex items-center justify-center">
            <Users2 size={10} className="text-white" />
          </div>
        )}
        {conv.isOfficial && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ios-blue border-2 border-white dark:border-surface-dark flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-[15px] font-semibold text-black dark:text-white truncate">
              {conv.user.nickname}
            </h4>
            {conv.isGroup && (
              <span className="text-[11px] text-ios-gray shrink-0">({conv.groupCount})</span>
            )}
            {conv.isMuted && (
              <Volume2 size={12} className="text-ios-gray3 shrink-0" style={{ opacity: 0.4 }} />
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[12px] text-ios-gray">{conv.time}</span>
            <ChevronRight size={16} className="text-ios-gray3" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-[13px] text-ios-gray line-clamp-1 flex-1">
            {conv.lastMessage}
          </p>
          {conv.unread > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={
                'shrink-0 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold text-white ' +
                (conv.isMuted ? 'bg-ios-gray' : 'bg-ios-red')
              }
            >
              {conv.unread > 99 ? '99+' : conv.unread}
            </motion.div>
          )}
        </div>
      </div>
    </Link>
  );
}
