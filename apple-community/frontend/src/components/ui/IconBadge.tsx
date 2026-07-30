'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface IconBadgeProps {
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'pink' | 'teal' | 'yellow' | 'indigo' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: 'bg-ios-blue',
  green: 'bg-ios-green',
  orange: 'bg-ios-orange',
  red: 'bg-ios-red',
  purple: 'bg-ios-purple',
  pink: 'bg-ios-pink',
  teal: 'bg-ios-teal',
  yellow: 'bg-ios-yellow',
  indigo: 'bg-ios-indigo',
  gray: 'bg-ios-gray',
};

const sizeMap = {
  sm: { wrapper: 'h-7 w-7', icon: 14 },
  md: { wrapper: 'h-8 w-8', icon: 18 },
  lg: { wrapper: 'h-10 w-10', icon: 22 },
};

export function IconBadge({ icon: Icon, color = 'blue', size = 'md', className }: IconBadgeProps) {
  const s = sizeMap[size];
  return (
    <div className={cn(
      'flex items-center justify-center rounded-lg text-white shrink-0',
      colorMap[color],
      s.wrapper,
      className
    )}>
      <Icon size={s.icon} strokeWidth={2.2} />
    </div>
  );
}

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizeClass = size === 'sm' ? 'h-5 px-1.5 text-[10px]' : size === 'lg' ? 'h-7 px-2.5 text-sm' : 'h-6 px-2 text-xs';
  
  let gradient = 'from-orange-400 to-orange-600';
  if (level >= 20) gradient = 'from-purple-400 to-purple-600';
  else if (level >= 15) gradient = 'from-red-400 to-red-600';
  else if (level >= 10) gradient = 'from-blue-400 to-blue-600';
  else if (level >= 5) gradient = 'from-green-400 to-green-600';
  else gradient = 'from-gray-400 to-gray-600';

  return (
    <div className={cn(
      `inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${gradient} text-white font-bold shrink-0`,
      sizeClass,
      className
    )}>
      <span className="opacity-90">Lv</span>
      <span>{level}</span>
    </div>
  );
}
