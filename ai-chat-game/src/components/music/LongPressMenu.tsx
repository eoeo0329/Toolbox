import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ListMusic, Disc3, Share2, X } from 'lucide-react';
import type { Song, LongPressAction } from '../../types/music';
import { useTheme } from '../../hooks/useTheme';

interface LongPressMenuProps {
  song: Song | null;
  visible: boolean;
  position: { x: number; y: number };
  onAction: (action: LongPressAction) => void;
  onClose: () => void;
}

const actions: {
  key: LongPressAction;
  label: string;
  icon: typeof Heart;
  accent: string;
}[] = [
  { key: 'favorite', label: '收藏', icon: Heart, accent: 'pink' },
  { key: 'next', label: '下一首播放', icon: ListMusic, accent: 'blue' },
  { key: 'album', label: '查看专辑', icon: Disc3, accent: 'purple' },
  { key: 'share', label: '分享', icon: Share2, accent: 'green' },
];

export function LongPressMenu({ song, visible, position, onAction, onClose }: LongPressMenuProps) {
  const { isDark } = useTheme();

  if (!song) return null;

  const accentColors: Record<string, { bg: string; glow: string }> = {
    pink: {
      bg: isDark ? 'rgba(255, 107, 138, 0.15)' : 'rgba(255, 45, 85, 0.12)',
      glow: isDark ? '0 0 20px rgba(255, 107, 138, 0.4)' : '0 0 16px rgba(255, 45, 85, 0.25)',
    },
    blue: {
      bg: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(0, 122, 255, 0.12)',
      glow: isDark ? '0 0 20px rgba(96, 165, 250, 0.4)' : '0 0 16px rgba(0, 122, 255, 0.25)',
    },
    purple: {
      bg: isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(88, 86, 214, 0.12)',
      glow: isDark ? '0 0 20px rgba(167, 139, 250, 0.4)' : '0 0 16px rgba(88, 86, 214, 0.25)',
    },
    green: {
      bg: isDark ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.12)',
      glow: isDark ? '0 0 20px rgba(52, 199, 89, 0.4)' : '0 0 16px rgba(52, 199, 89, 0.25)',
    },
  };

  const iconColors: Record<string, string> = {
    pink: isDark ? '#ff6b8a' : '#FF2D55',
    blue: isDark ? '#60a5fa' : '#007AFF',
    purple: isDark ? '#a78bfa' : '#5856D6',
    green: isDark ? '#34C759' : '#34C759',
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              background: isDark
                ? 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)'
                : 'radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 100%)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* 菜单卡片 */}
          <motion.div
            className="fixed z-50 w-80"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              left: Math.min(Math.max(position.x - 160, 16), window.innerWidth - 336),
              top: Math.min(Math.max(position.y - 20, 16), window.innerHeight - 380),
            }}
          >
            {/* 毛玻璃卡片 */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: isDark
                  ? 'rgba(28, 28, 30, 0.85)'
                  : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'saturate(180%) blur(30px)',
                WebkitBackdropFilter: 'saturate(180%) blur(30px)',
                border: isDark
                  ? '0.5px solid rgba(255,255,255,0.12)'
                  : '0.5px solid rgba(0,0,0,0.06)',
                boxShadow: isDark
                  ? '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255,255,255,0.05) inset'
                  : '0 20px 50px rgba(50, 70, 100, 0.22), 0 0 0 0.5px rgba(255,255,255,0.8) inset',
              }}
            >
              {/* 顶部歌曲信息栏 */}
              <div className="p-4 flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0,0,0,0.4)'
                      : '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-base truncate"
                    style={{ color: isDark ? '#fff' : '#1d1d1f' }}
                  >
                    {song.title}
                  </div>
                  <div
                    className="text-sm truncate"
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(60,60,67,0.55)',
                    }}
                  >
                    {song.artist}
                  </div>
                  <div
                    className="text-xs truncate mt-0.5"
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,60,67,0.35)',
                    }}
                  >
                    {song.album}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* 分隔线 */}
              <div
                className="mx-4"
                style={{
                  height: '0.5px',
                  background: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
                }}
              />

              {/* 操作按钮网格 */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  const colors = accentColors[action.accent];
                  const iconColor = iconColors[action.accent];
                  const isFavoriteActive = action.key === 'favorite' && song.favorite;

                  return (
                    <motion.button
                      key={action.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.05 }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: colors.glow,
                      }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onAction(action.key)}
                      className="relative flex flex-col items-center gap-1.5 p-3.5 rounded-2xl transition-all"
                      style={{
                        background: isFavoriteActive ? colors.bg : 'transparent',
                        border: isDark
                          ? `0.5px solid rgba(255,255,255,0.06)`
                          : `0.5px solid rgba(0,0,0,0.04)`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: colors.bg,
                          boxShadow: isFavoriteActive ? colors.glow : 'none',
                        }}
                      >
                        <Icon
                          size={20}
                          strokeWidth={2}
                          fill={isFavoriteActive ? iconColor : 'none'}
                          style={{ color: iconColor }}
                        />
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: isDark
                            ? 'rgba(255,255,255,0.8)'
                            : 'rgba(0,0,0,0.75)',
                        }}
                      >
                        {action.label}
                        {action.key === 'favorite' && song.favorite && (
                          <span
                            className="ml-1"
                            style={{ color: iconColors.pink }}
                          >
                            •
                          </span>
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 光晕锚点 */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                width: 200,
                height: 200,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: -1,
                background: isDark
                  ? 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 60%)'
                  : 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 60%)',
                filter: 'blur(20px)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
