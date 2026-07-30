'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: number;
  fallback?: string;
  ring?: boolean;
  ringColor?: string;
}

export function Avatar({
  src,
  alt = 'avatar',
  size = 40,
  fallback,
  ring = false,
  ringColor,
  className,
  ...props
}: AvatarProps) {
  const [error, setError] = React.useState(false);
  const showFallback = !src || error;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-ios-gray5 dark:bg-surface-secondary-dark items-center justify-center',
        ring && 'ring-2 ring-white dark:ring-surface-dark',
        ringColor && `ring-2 ${ringColor}`,
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {showFallback ? (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ios-blue to-ios-purple text-white font-semibold"
          style={{ fontSize: size * 0.4 }}
        >
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
