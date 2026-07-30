'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const checked = isControlled ? controlledChecked! : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !checked;
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onCheckedChange?.(newValue);
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className={cn(
        'ios-switch',
        checked && 'active',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="ios-switch-thumb" />
    </div>
  );
}
