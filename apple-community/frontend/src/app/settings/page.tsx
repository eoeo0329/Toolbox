'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  Moon,
  Sun,
  Type,
  Sparkles,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
  Users,
  Mail,
  FileText,
  HelpCircle,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { NavBar } from '@/components/ui/Navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ListItem, ListGroup } from '@/components/ui/ListItem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { cn, formatNumber } from '@/lib/utils';
import { LevelBadge } from '@/components/ui/IconBadge';

type FontSize = 'small' | 'medium' | 'large' | 'extraLarge';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { currentUser, settings, updateSettings, logout } = useApp();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === 'dark' || (settings.autoDarkMode && theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.04, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } },
  };

  return (
    <div className="pb-4">
      <NavBar
        title="设置"
        largeTitle
        showBackButton
        onBack={() => router.back()}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Account Card */}
        <motion.div variants={item} className="px-4 mb-2">
          <Card variant="default" padding="none" className="overflow-hidden cursor-pointer active:opacity-90 transition-opacity" onClick={() => router.push('/profile')}>
            <div className="flex items-center gap-4 p-5">
              <div className="relative">
                <Avatar src={currentUser?.avatar} size={60} fallback={currentUser?.nickname?.charAt(0)} ring />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[20px] font-bold text-black dark:text-white truncate">
                    {currentUser?.nickname}
                  </h3>
                  {currentUser && <LevelBadge level={currentUser.level} size="sm" />}
                </div>
                <p className="text-[13px] text-ios-gray mt-0.5 truncate font-mono">
                  {currentUser?.uid}
                </p>
                <p className="text-[13px] text-ios-gray mt-1 truncate">
                  积分: {formatNumber((currentUser?.points ?? 0) * 10)} · {currentUser?.followersCount} 粉丝
                </p>
              </div>
              <ChevronRight size={22} className="text-ios-gray3 shrink-0" />
            </div>
            <div className="mx-5 h-px bg-ios-gray5/80 dark:bg-white/10" />
            <div className="flex items-center gap-1 px-5 py-3 text-[14px] text-ios-blue hover:bg-ios-gray5/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <UserPlus size={18} className="text-ios-blue" />
              <span>邀请好友加入社区</span>
              <ArrowUpRight size={16} className="ml-auto text-ios-gray3" />
            </div>
          </Card>
        </motion.div>

        {/* Account Settings */}
        <motion.div variants={item}>
          <ListGroup title="账号">
            <ListItem
              icon={User}
              iconBg="indigo"
              title="个人资料"
              subtitle="头像、昵称、简介"
              onClick={() => console.log('Profile info')}
            />
            <ListItem
              icon={Shield}
              iconBg="blue"
              title="账号安全"
              subtitle="密码、登录设备"
              onClick={() => console.log('Security')}
            />
            <ListItem
              icon={Mail}
              iconBg="orange"
              title="绑定邮箱"
              value={currentUser ? '已绑定' : '未绑定'}
            />
          </ListGroup>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={item}>
          <ListGroup title="通知设置">
            <ListItem
              icon={Bell}
              iconBg="red"
              title="点赞通知"
              subtitle="收到点赞时提醒"
              switchValue={settings.notifications.likes}
              onSwitchChange={(v) => updateSettings({ notifications: { ...settings.notifications, likes: v } })}
              chevron={false}
            />
            <ListItem
              icon={MessageCircle}
              iconBg="green"
              title="评论通知"
              subtitle="收到评论时提醒"
              switchValue={settings.notifications.comments}
              onSwitchChange={(v) => updateSettings({ notifications: { ...settings.notifications, comments: v } })}
              chevron={false}
            />
            <ListItem
              icon={UserPlus}
              iconBg="purple"
              title="关注通知"
              subtitle="有新粉丝时提醒"
              switchValue={settings.notifications.follows}
              onSwitchChange={(v) => updateSettings({ notifications: { ...settings.notifications, follows: v } })}
              chevron={false}
            />
            <ListItem
              icon={AtSign}
              iconBg="blue"
              title="@ 提及通知"
              subtitle="被 @ 时提醒"
              switchValue={settings.notifications.mentions}
              onSwitchChange={(v) => updateSettings({ notifications: { ...settings.notifications, mentions: v } })}
              chevron={false}
            />
            <ListItem
              icon={AlertCircle}
              iconBg="orange"
              title="系统通知"
              subtitle="官方活动与公告"
              switchValue={settings.notifications.system}
              onSwitchChange={(v) => updateSettings({ notifications: { ...settings.notifications, system: v } })}
              chevron={false}
            />
          </ListGroup>
        </motion.div>

        {/* Display & Appearance */}
        <motion.div variants={item}>
          <ListGroup title="显示与亮度">
            <ListItem
              icon={Moon}
              iconBg="indigo"
              title="深色模式"
              switchValue={settings.darkMode}
              onSwitchChange={(v) => {
                updateSettings({ darkMode: v });
                setTheme(v ? 'dark' : 'light');
              }}
              chevron={false}
            >
              <div className="absolute inset-0 pointer-events-none opacity-0" aria-hidden>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Sun size={16} className={cn('transition-opacity', isDark ? 'opacity-0' : 'opacity-40')} />
                  <Moon size={16} className={cn('transition-opacity', isDark ? 'opacity-40' : 'opacity-0')} />
                </div>
              </div>
            </ListItem>
            <ListItem
              icon={Smartphone}
              iconBg="teal"
              title="自动切换"
              subtitle="跟随系统外观"
              switchValue={settings.autoDarkMode}
              onSwitchChange={(v) => {
                updateSettings({ autoDarkMode: v });
                if (v) setTheme('system');
              }}
              chevron={false}
            />
            <FontSizeItem
              current={settings.fontSize}
              onChange={(v) => updateSettings({ fontSize: v })}
            />
            <ListItem
              icon={Sparkles}
              iconBg="pink"
              title="减少动态效果"
              subtitle="降低动画强度"
              switchValue={settings.reduceMotion}
              onSwitchChange={(v) => updateSettings({ reduceMotion: v })}
              chevron={false}
            />
          </ListGroup>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={item}>
          <ListGroup title="隐私与权限">
            <ListItem
              icon={Eye}
              iconBg="blue"
              title="帖子可见范围"
              value={
                settings.privacy.showPosts === 'public' ? '公开' :
                settings.privacy.showPosts === 'followers' ? '仅粉丝' : '仅自己'
              }
              onClick={() => console.log('Post visibility')}
            />
            <ListItem
              icon={Users}
              iconBg="green"
              title="显示关注列表"
              switchValue={settings.privacy.showFollowing}
              onSwitchChange={(v) => updateSettings({ privacy: { ...settings.privacy, showFollowing: v } })}
              chevron={false}
            />
            <ListItem
              icon={Heart}
              iconBg="red"
              title="显示粉丝列表"
              switchValue={settings.privacy.showFollowers}
              onSwitchChange={(v) => updateSettings({ privacy: { ...settings.privacy, showFollowers: v } })}
              chevron={false}
            />
            <ListItem
              icon={MessageCircle}
              iconBg="purple"
              title="谁可以私信我"
              value={
                settings.privacy.allowMessages === 'everyone' ? '所有人' :
                settings.privacy.allowMessages === 'followers' ? '仅粉丝' : '没有人'
              }
              onClick={() => console.log('Message privacy')}
            />
            <ListItem
              icon={EyeOff}
              iconBg="gray"
              title="黑名单管理"
              subtitle="1 人被屏蔽"
              value="1"
            />
          </ListGroup>
        </motion.div>

        {/* About */}
        <motion.div variants={item}>
          <ListGroup title="关于应用">
            <ListItem
              icon={Info}
              iconBg="blue"
              title="版本信息"
              value="v1.0.0 (Build 2026.0730)"
              interactive={false}
              chevron={false}
            />
            <ListItem
              icon={FileText}
              iconBg="orange"
              title="用户协议"
            />
            <ListItem
              icon={Shield}
              iconBg="green"
              title="隐私政策"
            />
            <ListItem
              icon={HelpCircle}
              iconBg="purple"
              title="帮助与反馈"
            />
            <ListItem
              icon={Star}
              iconBg="yellow"
              title="给我们评分"
              subtitle="在 App Store 评价"
            />
          </ListGroup>
        </motion.div>

        {/* Logout */}
        <motion.div variants={item} className="mt-8">
          <ListGroup>
            <ListItem
              icon={LogOut}
              iconBg="red"
              title="退出登录"
              destructive
              chevron={false}
              onClick={() => {
                if (confirm('确定要退出登录吗？')) {
                  logout();
                  router.push('/home');
                }
              }}
            />
          </ListGroup>
        </motion.div>

        {/* Version footer */}
        <motion.div variants={item} className="text-center py-8 px-4">
          <p className="text-[12px] text-ios-gray3">
            Designed with 🍎 in Cupertino
          </p>
          <p className="text-[11px] text-ios-gray3 mt-1">
            © 2026 Apple Community. All rights reserved.
          </p>
        </motion.div>

        {/* Extra spacing for bottom */}
        <div className="h-4" />
      </motion.div>
    </div>
  );
}

function FontSizeItem({
  current,
  onChange,
}: {
  current: FontSize;
  onChange: (v: FontSize) => void;
}) {
  const options: { value: FontSize; label: string; size: string }[] = [
    { value: 'small', label: 'S', size: 'text-[13px]' },
    { value: 'medium', label: 'M', size: 'text-[15px]' },
    { value: 'large', label: 'L', size: 'text-[17px]' },
    { value: 'extraLarge', label: 'XL', size: 'text-[19px]' },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark px-5 py-3.5">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ios-teal text-white">
          <Type size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-medium text-black dark:text-white">字体大小</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2 bg-ios-gray5 dark:bg-white/5 rounded-xl p-1">
        {options.map((opt) => {
          const isActive = current === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex-1 flex items-center justify-center py-2 rounded-lg font-bold transition-all duration-200',
                opt.size,
                isActive
                  ? 'bg-surface-light dark:bg-surface-dark text-black dark:text-white shadow-sm'
                  : 'text-ios-gray'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
