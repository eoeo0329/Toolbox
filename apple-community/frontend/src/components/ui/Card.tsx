'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-light dark:bg-surface-dark rounded-ios',
      elevated: 'bg-surface-light dark:bg-surface-dark rounded-ios shadow-ios-lg',
      glass: 'glass rounded-ios-xl shadow-glass border border-white/20 dark:border-white/10',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7',
    };

    const Component = interactive ? motion.div : 'div';
    const interactiveProps = interactive
      ? {
          whileHover: { y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }
      : {};

    return (
      <Component
        ref={ref as any}
        className={cn(variants[variant], paddings[padding], className)}
        {...interactiveProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Card.displayName = 'Card';
