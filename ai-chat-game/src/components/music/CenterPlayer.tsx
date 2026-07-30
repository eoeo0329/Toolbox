import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import type { Song } from '../../types/music';
import { useTheme } from '../../hooks/useTheme';

interface CenterPlayerProps {
  song: Song;
  isPlaying: boolean;
  progress: number;
  intensity: number; // 音乐节奏强度 0-1
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFavorite: () => void;
}

export function CenterPlayer({
  song,
  isPlaying,
  progress,
  intensity,
  onTogglePlay,
  onPrev,
  onNext,
  onFavorite,
}: CenterPlayerProps) {
  const { isDark } = useTheme();

  // 格式化时间
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTime = progress * song.duration;

  // 音乐强度计算出的缩放和发光
  const scaleBoost = 1 + intensity * 0.08;
  const glowBoost = 20 + intensity * 60;

  return (
    <div className="relative flex flex-col items-center pointer-events-auto">
      {/* 外层发光光环 */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          scale: [0.95 * scaleBoost, 1.05 * scaleBoost, 0.95 * scaleBoost],
          opacity: isPlaying ? [0.5, 0.8, 0.5] : 0.3,
        }}
        transition={{
          duration: isPlaying ? 0.6 + intensity * 0.4 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 280,
          height: 280,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isDark
            ? `radial-gradient(circle, rgba(147, 197, 253, ${0.15 + intensity * 0.15}) 0%, rgba(167, 139, 250, ${0.08 + intensity * 0.1}) 40%, transparent 70%)`
            : `radial-gradient(circle, rgba(255, 255, 255, ${0.6 + intensity * 0.3}) 0%, rgba(200, 220, 255, ${0.3 + intensity * 0.2}) 50%, transparent 75%)`,
          boxShadow: isDark
            ? `0 0 ${glowBoost}px rgba(147, 197, 253, ${0.4 + intensity * 0.3}), 0 0 ${glowBoost * 0.5}px rgba(167, 139, 250, ${0.3 + intensity * 0.2})`
            : `0 0 ${glowBoost}px rgba(255, 255, 255, ${0.8 + intensity * 0.2}), 0 0 ${glowBoost * 0.5}px rgba(180, 200, 230, 0.5)`,
        }}
      />

      {/* 第二层辉光 */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          scale: isPlaying ? [1, 1.02 + intensity * 0.03, 1] : 1,
        }}
        transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 230,
          height: 230,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isDark
            ? `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)`
            : `radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)`,
        }}
      />

      {/* 专辑封面 */}
      <motion.div
        className="relative rounded-full overflow-hidden z-10"
        animate={{
          rotate: isPlaying ? 360 : 0,
          scale: scaleBoost,
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 0.15, ease: 'easeOut' },
        }}
        style={{
          width: 200,
          height: 200,
          boxShadow: isDark
            ? `0 20px 60px rgba(0, 0, 0, 0.6), 0 0 ${30 + intensity * 30}px rgba(147, 197, 253, ${0.3 + intensity * 0.2}), inset 0 0 40px rgba(255,255,255,0.05)`
            : `0 25px 50px rgba(100, 120, 150, 0.25), 0 0 ${30 + intensity * 20}px rgba(200, 220, 255, 0.6), inset 0 0 30px rgba(255,255,255,0.3)`,
          border: isDark ? '2px solid rgba(255,255,255,0.1)' : '3px solid rgba(255,255,255,0.8)',
        }}
      >
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* 封面中心的黑胶唱片孔 */}
        <div
          className="absolute rounded-full"
          style={{
            width: 36,
            height: 36,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: isDark
              ? 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)'
              : 'radial-gradient(circle, #fff 0%, #e8e8e8 100%)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '2px solid rgba(180,200,220,0.4)',
            boxShadow: isDark ? 'inset 0 0 8px rgba(0,0,0,0.8)' : 'inset 0 0 6px rgba(0,0,0,0.08)',
          }}
        />
        {/* 唱片纹路（暗色模式） */}
        {isDark && (
          <>
            <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
          </>
        )}
      </motion.div>

      {/* 播放按钮（悬浮在封面右下） */}
      <motion.button
        onClick={onTogglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="absolute z-20 flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 64,
          height: 64,
          right: -8,
          bottom: 16,
          background: isDark
            ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
          boxShadow: isDark
            ? `0 8px 24px rgba(59, 130, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)`
            : `0 10px 25px rgba(0, 122, 255, 0.35), 0 0 20px rgba(88, 86, 214, 0.2)`,
          border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.6)',
        }}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Pause size={28} className="text-white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Play size={28} className="text-white ml-1" strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 歌曲信息 */}
      <motion.div
        className="mt-10 flex flex-col items-center text-center z-10 w-full max-w-sm px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={song.id}
        transition={{ duration: 0.4 }}
      >
        {/* 进度条 */}
        <div className="w-full mb-6">
          <div
            className="relative h-1 rounded-full overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: isDark
                  ? 'linear-gradient(90deg, #60a5fa, #a78bfa)'
                  : 'linear-gradient(90deg, #007AFF, #5856D6)',
                boxShadow: isDark
                  ? '0 0 10px rgba(96, 165, 250, 0.6)'
                  : '0 0 8px rgba(0, 122, 255, 0.5)',
              }}
            />
          </div>
          <div
            className="flex justify-between mt-2 text-xs"
            style={{
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(song.duration)}</span>
          </div>
        </div>

        {/* 歌曲名 */}
        <motion.h2
          className="text-2xl font-bold tracking-tight mb-1.5"
          animate={{
            scale: isPlaying ? [1, 1 + intensity * 0.02, 1] : 1,
          }}
          transition={{ duration: 0.4, repeat: Infinity }}
          style={{
            color: isDark ? '#fff' : '#1d1d1f',
            textShadow: isDark ? `0 0 20px rgba(147, 197, 253, ${0.3 + intensity * 0.3})` : 'none',
          }}
        >
          {song.title}
        </motion.h2>

        {/* 歌手 */}
        <p
          className="text-base mb-5"
          style={{
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(60,60,67,0.6)',
          }}
        >
          {song.artist} · {song.album}
        </p>

        {/* 控制按钮 */}
        <div className="flex items-center gap-8">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={onFavorite}
            className="p-2 rounded-full transition-colors"
            style={{
              color: song.favorite
                ? (isDark ? '#ff6b8a' : '#FF2D55')
                : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
            }}
          >
            <motion.div
              animate={song.favorite ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart size={24} fill={song.favorite ? 'currentColor' : 'none'} strokeWidth={2} />
            </motion.div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={onPrev}
            className="p-2 rounded-full"
            style={{
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)',
            }}
          >
            <SkipBack size={28} strokeWidth={2} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={onNext}
            className="p-2 rounded-full"
            style={{
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)',
            }}
          >
            <SkipForward size={28} strokeWidth={2} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="p-2 rounded-full"
            style={{
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
            }}
          >
            <Volume2 size={24} strokeWidth={2} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
