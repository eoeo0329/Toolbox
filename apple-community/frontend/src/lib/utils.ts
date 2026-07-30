import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export function generateUID(): string {
  return 'UID' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function levelToPoints(level: number): number {
  return level * level * 100;
}

export function pointsToLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function getLevelProgress(points: number): number {
  const currentLevel = pointsToLevel(points);
  const prevLevelPoints = levelToPoints(currentLevel - 1);
  const nextLevelPoints = levelToPoints(currentLevel);
  const progress = (points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints);
  return Math.min(Math.max(progress, 0), 1);
}

export function getRandomAvatar(seed?: string): string {
  const s = seed || Math.random().toString(36).substring(7);
  return `https://i.pravatar.cc/150?u=${s}`;
}

export function getRandomImage(width: number = 600, height: number = 400): string {
  return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
