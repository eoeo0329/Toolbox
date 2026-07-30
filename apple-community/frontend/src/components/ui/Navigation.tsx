'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Plus, MessageCircle, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface NavBarProps {
  title?: string;
  largeTitle?: boolean;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  transparent?: boolean;
  onBack?: () => void;
}

export function NavBar({
  title,
  largeTitle = false,
  showBackButton = false,
  rightContent,
  transparent = false,
  onBack,
}: NavBarProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      {/* Top nav bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-area-top',
          !transparent && (scrolled || !largeTitle)
            ? 'nav-blur bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/10'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="h-11 px-4 flex items-center justify-between relative">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="flex items-center -ml-2 px-2 py-1 -mr-2 rounded-full text-ios-blue hover:bg-ios-blue/10 active:bg-ios-blue/20 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[17px] ml-0.5">返回</span>
            </button>
          ) : (
            <div className="w-20" />
          )}

          {!largeTitle && title && (
            <motion.h1
              key={title}
              initial={{ opacity: 0 }}
              animate={{ opacity: scrolled ? 1 : 0 }}
              className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-black dark:text-white"
            >
              {title}
            </motion.h1>
          )}

          <div className="flex items-center gap-1">
            {rightContent}
          </div>
        </div>

        {/* Large title */}
        {largeTitle && title && (
          <div className="px-5 pb-3 pt-1">
            <motion.h1
              key={`large-${title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'text-[34px] font-bold tracking-tight text-black dark:text-white transition-opacity duration-200',
                scrolled && 'opacity-0 pointer-events-none h-0 overflow-hidden pb-0 pt-0'
              )}
            >
              {title}
            </motion.h1>
          </div>
        )}
      </motion.div>

      {/* Spacer for fixed nav */}
      <div className={cn(
        'safe-area-top',
        largeTitle ? 'h-[100px]' : 'h-[44px]'
      )} />
    </>
  );
}

interface TabBarProps {
  floating?: boolean;
}

export function TabBar({ floating = true }: TabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadNotificationsCount, unreadMessagesCount, currentUser } = useApp();

  const tabs = [
    { id: 'home', label: '首页', icon: Home, href: '/home' },
    { id: 'search', label: '发现', icon: Search, href: '/search' },
    { id: 'post', label: '发布', icon: Plus, href: '/post', special: true },
    { id: 'messages', label: '消息', icon: MessageCircle, href: '/messages', badge: unreadMessagesCount },
    { id: 'profile', label: '我的', icon: User, href: '/profile', badge: unreadNotificationsCount },
  ];

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Tab bar spacer */}
      <div className="h-[84px] safe-area-bottom" />

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 safe-area-bottom',
          floating ? 'px-3 pb-3' : ''
        )}
      >
        <div className={cn(
          'flex items-end h-16 relative',
          floating
            ? 'bg-white/80 dark:bg-black/80 nav-blur rounded-2xl shadow-ios-xl border border-white/40 dark:border-white/10'
            : 'nav-blur bg-white/80 dark:bg-black/80 border-t border-black/5 dark:border-white/10'
        )}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            const hasBadge = tab.badge && tab.badge > 0;

            if (tab.special) {
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.href)}
                  className="flex flex-col items-center justify-center h-full flex-1 -mt-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center shadow-ios-lg text-white"
                  >
                    <Icon size={28} strokeWidth={2.5} />
                  </motion.div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className="flex flex-col items-center justify-center h-full flex-1 gap-0.5 relative"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active ? 'active' : 'inactive'}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <Icon
                      size={24}
                      strokeWidth={active ? 2.5 : 2}
                      className={cn(
                        'transition-colors',
                        active ? 'text-ios-blue' : 'text-ios-gray2'
                      )}
                      fill={active ? 'rgba(0,122,255,0.1)' : 'none'}
                    />
                    {hasBadge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-ios-red text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-black"
                      >
                        {tab.badge! > 99 ? '99+' : tab.badge}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    active ? 'text-ios-blue' : 'text-ios-gray2'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
