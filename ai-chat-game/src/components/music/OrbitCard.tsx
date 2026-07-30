import { motion } from 'framer-motion';
import { Heart, Music2 } from 'lucide-react';
import type { Song } from '../../types/music';
import { useTheme } from '../../hooks/useTheme';

interface OrbitCardProps {
  song: Song;
  angle: number;
  radius: number;
  orbitIndex: number;
  rotationOffset: number;
  isActive: boolean;
  isHovered: boolean;
  intensity: number;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

export function OrbitCard({
  song,
  angle,
  radius,
  orbitIndex,
  rotationOffset,
  isActive,
  isHovered,
  intensity,
  onClick,
  onHover,
  onLongPressStart,
  onLongPressEnd,
}: OrbitCardProps) {
  const { isDark } = useTheme();

  // 角度加上整体旋转
  const finalAngle = angle + rotationOffset;

  // 计算屏幕空间位置（椭圆轨道，y轴压缩营造3D感）
  const rad = (finalAngle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const z = Math.sin(rad); // 用sin作为深度

  // y轴压缩 + 深度偏移，营造环形3D效果
  const y = z * radius * 0.35;
  const depth = (z + 1) / 2; // 0（远）到1（近）

  // 基于深度的视觉参数
  const scale = 0.45 + depth * 0.55 + (isHovered ? 0.15 : 0);
  const opacity = 0.25 + depth * 0.75;
  const zIndex = Math.floor(depth * 100) + (isHovered ? 200 : 0) + orbitIndex * 10;

  // 卡片尺寸（根据轨道）
  const baseSize = orbitIndex === 0 ? 82 : orbitIndex === 1 ? 66 : 54;
  const actualSize = baseSize * scale;

  // 景深模糊：远处的稍微模糊
  const blur = depth > 0.7 ? 0 : (1 - depth) * 3;

  // 长按定时器
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let isLongPressed = false;

  const handlePointerDown = () => {
    isLongPressed = false;
    pressTimer = setTimeout(() => {
      isLongPressed = true;
      onLongPressStart();
    }, 450);
  };

  const handlePointerUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (!isLongPressed) {
      onClick();
    }
    onLongPressEnd();
  };

  const handlePointerLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    onLongPressEnd();
    onHover(false);
  };

  // 播放状态的轻微脉冲
  const pulseScale = 1 + intensity * 0.04 * depth;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        x,
        y,
        zIndex,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      initial={false}
      animate={{
        scale: pulseScale,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* 卡片容器，反向补偿整体旋转，保持卡片直立朝向观众 */}
      <motion.div
        style={{
          width: actualSize,
          height: actualSize,
          marginLeft: -actualSize / 2,
          marginTop: -actualSize / 2,
          opacity,
          filter: `blur(${blur}px)`,
          transform: `translateZ(${depth * 80}px) rotateX(${-z * 12}deg)`,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={() => onHover(true)}
        onPointerCancel={handlePointerUp}
      >
        {/* 阴影层（仅前景卡片可见） */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          style={{
            opacity: depth * 0.8,
            background: isDark
              ? `radial-gradient(ellipse at center bottom, rgba(59, 130, 246, ${0.25 + depth * 0.2}), transparent 70%)`
              : `radial-gradient(ellipse at center bottom, rgba(100, 130, 180, ${0.15 + depth * 0.15}), transparent 70%)`,
            transform: 'translateY(10px) scale(0.9, 0.35)',
            filter: 'blur(6px)',
            zIndex: -1,
          }}
        />

        {/* 实际卡片 */}
        <motion.div
          className="w-full h-full relative rounded-2xl overflow-hidden transition-shadow"
          whileHover={depth > 0.5 ? { translateY: -4 } : {}}
          style={{
            boxShadow: isDark
              ? `0 ${8 + depth * 8}px ${24 + depth * 16}px rgba(0, 0, 0, ${0.4 + depth * 0.3}), inset 0 1px 0 rgba(255,255,255,${0.08 + depth * 0.06})`
              : `0 ${6 + depth * 6}px ${20 + depth * 14}px rgba(100, 120, 150, ${0.15 + depth * 0.2}), inset 0 1px 0 rgba(255,255,255,${0.5 + depth * 0.3})`,
            border: isDark
              ? `1px solid rgba(255,255,255,${0.06 + depth * 0.08})`
              : `${1 + depth * 0.5}px solid rgba(255,255,255,${0.6 + depth * 0.3})`,
            background: isDark ? '#1c1c1e' : '#fff',
          }}
        >
          <img
            src={song.cover}
            alt={song.title}
            className="w-full h-full object-cover"
            draggable={false}
            loading="lazy"
          />

          {/* 高光层（玻璃质感） */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 55%)',
            }}
          />

          {/* 高亮选中环 */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                boxShadow: [
                  isDark
                    ? 'inset 0 0 0 2px rgba(96, 165, 250, 0.9), 0 0 20px rgba(96, 165, 250, 0.5)'
                    : 'inset 0 0 0 2px rgba(0, 122, 255, 0.9), 0 0 18px rgba(0, 122, 255, 0.4)',
                  isDark
                    ? 'inset 0 0 0 3px rgba(167, 139, 250, 1), 0 0 32px rgba(167, 139, 250, 0.7)'
                    : 'inset 0 0 0 3px rgba(88, 86, 214, 1), 0 0 28px rgba(88, 86, 214, 0.55)',
                  isDark
                    ? 'inset 0 0 0 2px rgba(96, 165, 250, 0.9), 0 0 20px rgba(96, 165, 250, 0.5)'
                    : 'inset 0 0 0 2px rgba(0, 122, 255, 0.9), 0 0 18px rgba(0, 122, 255, 0.4)',
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}

          {/* 播放状态指示（播放中 + 前景） */}
          {isActive && depth > 0.5 && (
            <div
              className="absolute top-1 right-1 flex gap-0.5 items-end"
              style={{ height: 12 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 3,
                    background: isDark ? '#93c5fd' : '#007AFF',
                    boxShadow: isDark ? '0 0 4px rgba(147, 197, 253, 0.8)' : 'none',
                  }}
                  animate={{
                    height: [4, 10 + intensity * 4, 6, 8 + intensity * 3, 4],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* 收藏标记 */}
          {song.favorite && depth > 0.4 && (
            <div
              className="absolute top-1 left-1"
              style={{
                color: isDark ? '#ff6b8a' : '#FF2D55',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              }}
            >
              <Heart size={12} fill="currentColor" strokeWidth={0} />
            </div>
          )}

          {/* 悬停时显示信息浮层 */}
          <AnimateInfo song={song} isHovered={isHovered && depth > 0.3} isDark={isDark} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function AnimateInfo({ song, isHovered, isDark }: { song: Song; isHovered: boolean; isDark: boolean }) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 p-2 pointer-events-none"
      initial={false}
      animate={{
        opacity: isHovered ? 1 : 0,
        y: isHovered ? 0 : 10,
      }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="rounded-lg px-2 py-1.5 backdrop-blur-md"
        style={{
          background: isDark
            ? 'rgba(28, 28, 30, 0.75)'
            : 'rgba(255, 255, 255, 0.8)',
          border: isDark
            ? '0.5px solid rgba(255,255,255,0.1)'
            : '0.5px solid rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="flex items-center gap-1 mb-0.5"
          style={{ color: isDark ? '#fff' : '#1d1d1f' }}
        >
          <Music2 size={10} strokeWidth={2.5} />
          <span className="font-semibold text-[10px] truncate leading-tight">
            {song.title}
          </span>
        </div>
        <div
          className="text-[9px] truncate leading-tight"
          style={{
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(60,60,67,0.55)',
          }}
        >
          {song.artist}
        </div>
      </div>
    </motion.div>
  );
}
