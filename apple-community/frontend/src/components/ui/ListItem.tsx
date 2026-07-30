'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  iconBg?: string;
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  chevron?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (checked: boolean) => void;
  destructive?: boolean;
  interactive?: boolean;
  first?: boolean;
  last?: boolean;
  avatar?: string;
  avatarFallback?: string;
}

const defaultIconBgColors: Record<string, string> = {
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

import { Avatar } from './Avatar';
import { Switch } from './Switch';

export function ListItem({
  icon: Icon,
  iconBg = 'bg-ios-blue',
  title,
  subtitle,
  value,
  chevron = true,
  switchValue,
  onSwitchChange,
  destructive = false,
  interactive = true,
  first = false,
  last = false,
  avatar,
  avatarFallback,
  className,
  onClick,
  children,
  ...props
}: ListItemProps) {
  const iconBgClass = defaultIconBgColors[iconBg] || iconBg;

  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {avatar && (
          <Avatar src={avatar} alt={title} size={44} fallback={avatarFallback} />
        )}
        {Icon && !avatar && (
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white',
            iconBgClass
          )}>
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className={cn(
            'text-[17px] leading-tight truncate',
            destructive ? 'text-ios-red' : 'text-black dark:text-white'
          )}>
            {title}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-[13px] text-ios-gray truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pl-2 shrink-0">
        {value !== undefined && typeof value !== 'boolean' && (
          <div className="text-[15px] text-ios-gray">{value}</div>
        )}
        {switchValue !== undefined && (
          <Switch checked={switchValue} onCheckedChange={onSwitchChange} />
        )}
        {chevron && switchValue === undefined && (
          <ChevronRight size={20} className="text-ios-gray3 shrink-0" strokeWidth={2} />
        )}
      </div>
    </>
  );

  const Wrapper = interactive ? motion.div : 'div';
  const interactiveProps = interactive
    ? {
        whileTap: { scale: 0.995, backgroundColor: 'rgba(142,142,147,0.12)' },
        transition: { type: 'spring', stiffness: 500, damping: 30 },
        onClick,
      }
    : {};

  return (
    <Wrapper
      className={cn(
        'flex items-center px-5 py-3.5 bg-surface-light dark:bg-surface-dark cursor-pointer',
        first && 'rounded-t-ios',
        last && 'rounded-b-ios',
        !interactive && 'cursor-default',
        className
      )}
      {...interactiveProps}
      {...props}
    >
      {content}
      {children}
    </Wrapper>
  );
}

interface ListGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  footer?: string;
  inset?: boolean;
}

export function ListGroup({ title, footer, inset = true, className, children, ...props }: ListGroupProps) {
  const childArray = React.Children.toArray(children);
  
  return (
    <div className={cn(inset ? 'px-4' : '', className)} {...props}>
      {title && (
        <div className="px-1 pb-2 pt-6 text-[13px] uppercase font-semibold text-ios-gray tracking-wide">
          {title}
        </div>
      )}
      <div className="overflow-hidden rounded-ios shadow-ios">
        {childArray.map((child, i) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement<ListItemProps>, {
            first: i === 0,
            last: i === childArray.length - 1,
          } as Partial<ListItemProps>);
        })}
      </div>
      {footer && (
        <div className="px-1 pt-2 text-[13px] text-ios-gray leading-relaxed">
          {footer}
        </div>
      )}
    </div>
  );
}
