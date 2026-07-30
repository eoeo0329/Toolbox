'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-ios transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap';
    
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-ios-blue text-white hover:bg-ios-blue/90 shadow-ios',
      secondary: 'bg-ios-gray5 dark:bg-surface-secondary-dark text-black dark:text-white hover:bg-ios-gray5/80 dark:hover:bg-surface-secondary-dark/80',
      ghost: 'bg-transparent text-ios-blue hover:bg-ios-blue/10 dark:hover:bg-ios-blue/20',
      destructive: 'bg-ios-red text-white hover:bg-ios-red/90',
      outline: 'border border-ios-gray4 dark:border-white/20 bg-transparent hover:bg-ios-gray5 dark:hover:bg-white/10',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-11 px-5 text-[15px]',
      lg: 'h-14 px-7 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <motion.button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
