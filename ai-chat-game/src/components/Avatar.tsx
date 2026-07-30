import type { AIAvatar } from '../types';

interface Props {
  avatar: AIAvatar;
  size?: number;
  rounded?: 'full' | 'lg' | 'xl';
  showEmoji?: boolean;
  className?: string;
}

export default function Avatar({ avatar, size = 56, rounded = 'full', showEmoji = true, className = '' }: Props) {
  const r =
    rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-2xl' : 'rounded-xl';
  return (
    <div
      className={`${avatar.gradient} ${r} flex items-center justify-center text-white font-semibold select-none shadow-inner2 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      <span className="leading-none drop-shadow-sm">
        {showEmoji ? avatar.emoji : avatar.name.slice(0, 1)}
      </span>
    </div>
  );
}
