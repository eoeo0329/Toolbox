'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  const baseClass = 'skeleton rounded-md';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-ios h-48',
  };

  const styles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(baseClass, variants[variant], className)}
      style={styles}
      {...props}
    />
  );
}

export function SkeletonPost() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-ios p-5 shadow-ios animate-pulse-slow">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" className="h-3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="70%" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={100} />
      </div>
      <div className="flex gap-8">
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={60} />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-ios p-5 shadow-ios space-y-4 animate-pulse-slow">
      <Skeleton variant="text" width="50%" className="h-5" />
      <Skeleton variant="rectangular" height={160} />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  );
}
