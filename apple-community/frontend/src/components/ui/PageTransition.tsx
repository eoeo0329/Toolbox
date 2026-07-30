'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 页面过渡动画包装组件，提供 iOS 风格的页面切换效果
 */
export default function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 25,
          mass: 0.5,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 页面进入时的 iOS 风格动画
 */
export function PageEnter({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 模态弹出动画（类似 iOS 弹窗）
 */
export function ModalEnter({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-3xl bg-surface-light dark:bg-surface-dark overflow-hidden shadow-ios-xl"
          >
            <div className="w-12 h-1.5 bg-ios-gray4 dark:bg-white/20 rounded-full mx-auto mt-3 mb-2" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * 下拉刷新容器包装
 */
export function PullToRefresh({
  onRefresh,
  children,
  refreshing,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  refreshing: boolean;
}) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const startY = React.useRef(0);
  const isPulling = React.useRef(false);
  const threshold = 80;

  const handleStart = (clientY: number) => {
    if (window.scrollY === 0 && !refreshing) {
      startY.current = clientY;
      isPulling.current = true;
    }
  };

  const handleMove = (clientY: number) => {
    if (!isPulling.current) return;
    const distance = Math.max(0, clientY - startY.current);
    const dampedDistance = distance * 0.5;
    setPullDistance(Math.min(dampedDistance, threshold * 1.5));
  };

  const handleEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= threshold) {
      setPullDistance(threshold);
      await onRefresh();
    }
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      <motion.div
        initial={false}
        animate={{ height: pullDistance }}
        className="flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {pullDistance > 0 && (
          <div className="flex flex-col items-center gap-1 text-ios-gray">
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <span className="text-[12px]">
              {refreshing ? '正在刷新...' : pullDistance >= threshold ? '松开刷新' : '下拉刷新'}
            </span>
          </div>
        )}
      </motion.div>
      {children}
    </div>
  );
}
