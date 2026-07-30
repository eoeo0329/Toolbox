import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Grid3X3, Shuffle, Repeat } from 'lucide-react';
import { ParticleBackground } from './ParticleBackground';
import { CenterPlayer } from './CenterPlayer';
import { OrbitCard } from './OrbitCard';
import { LongPressMenu } from './LongPressMenu';
import type { Song, LongPressAction } from '../../types/music';
import { mockSongs } from '../../data/mockSongs';
import { useTheme } from '../../hooks/useTheme';

// 轨道配置：半径、倾斜、每首歌角度间隔
const ORBITS = [
  { radius: 300, tiltY: 15, songsPerOrbit: 6 },
  { radius: 430, tiltY: 22, songsPerOrbit: 5 },
  { radius: 560, tiltY: 28, songsPerOrbit: 5 },
];

export function OrbitalPlaylist() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [rotation, setRotation] = useState(0); // 整体旋转角度
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(0.08); // 度/帧 (自动旋转速度)
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(0.3); // 节奏模拟强度
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'orbit' | 'list'>('orbit'); // 备用切换
  void viewMode;
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 手势相关refs
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    velocityX: 0,
    moved: false,
  });
  const animationRef = useRef<number | undefined>(undefined);
  const lastFrameTime = useRef<number>(0);
  const showToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSong = songs[activeIndex];

  // 分配歌曲到轨道：返回每首歌的 {orbitIndex, angle, song}
  const orbitLayout = useMemo(() => {
    const layout: Array<{
      song: Song;
      orbitIndex: number;
      baseAngle: number;
      radius: number;
      tiltY: number;
    }> = [];

    let songCursor = 0;
    ORBITS.forEach((orbit, oi) => {
      for (let i = 0; i < orbit.songsPerOrbit; i++) {
        if (songCursor >= songs.length) break;
        // 排除当前active歌曲，它放在中心
        if (songCursor === activeIndex) {
          songCursor++;
          if (songCursor >= songs.length) break;
        }
        const angle = (i / orbit.songsPerOrbit) * 360 + oi * 25;
        layout.push({
          song: songs[songCursor],
          orbitIndex: oi,
          baseAngle: angle,
          radius: orbit.radius,
          tiltY: orbit.tiltY,
        });
        songCursor++;
      }
    });

    return layout;
  }, [songs, activeIndex]);

  // 显示临时提示
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (showToastTimer.current) clearTimeout(showToastTimer.current);
    showToastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // 动画主循环：自动旋转、进度、节奏强度
  useEffect(() => {
    const tick = (time: number) => {
      const dt = Math.min((time - (lastFrameTime.current || time)) / 1000, 0.05);
      lastFrameTime.current = time;

      // 自动旋转（没在拖动时）
      if (!dragRef.current.active && isPlaying) {
        setRotation((r) => r + autoRotateSpeed);
      }

      // 进度条
      if (isPlaying && activeSong) {
        setProgress((p) => {
          const next = p + dt / activeSong.duration;
          if (next >= 1) {
            // 播放完
            if (repeatOn) return 0;
            handleNext();
            return 0;
          }
          return next;
        });
      }

      // 模拟音乐节奏强度（随机波动）
      if (isPlaying) {
        setIntensity((prev) => {
          const target = 0.25 + Math.abs(Math.sin(time * 0.003)) * 0.55 + Math.random() * 0.1;
          return prev + (target - prev) * 0.12;
        });
      } else {
        setIntensity((prev) => prev + (0.15 - prev) * 0.08);
      }

      // 惯性滚动
      if (!dragRef.current.active && Math.abs(dragRef.current.velocityX) > 0.01) {
        setRotation((r) => r + dragRef.current.velocityX);
        dragRef.current.velocityX *= 0.94;
      }

      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, autoRotateSpeed, activeSong, repeatOn]);

  // 切换歌曲
  const switchToSong = useCallback((songId: string) => {
    const idx = songs.findIndex((s) => s.id === songId);
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx);
      setProgress(0);
      // 给一个旋转推一下的感觉
      setRotation((r) => r + 8);
    }
  }, [songs, activeIndex]);

  const handleNext = useCallback(() => {
    if (shuffleOn) {
      let nextIdx = Math.floor(Math.random() * songs.length);
      if (nextIdx === activeIndex && songs.length > 1) {
        nextIdx = (nextIdx + 1) % songs.length;
      }
      setActiveIndex(nextIdx);
    } else {
      setActiveIndex((i) => (i + 1) % songs.length);
    }
    setProgress(0);
  }, [songs.length, shuffleOn, activeIndex]);

  const handlePrev = useCallback(() => {
    if (progress > 0.1) {
      setProgress(0);
      return;
    }
    setActiveIndex((i) => (i - 1 + songs.length) % songs.length);
    setProgress(0);
  }, [songs.length, progress]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const toggleFavorite = useCallback(() => {
    setSongs((list) =>
      list.map((s, i) =>
        i === activeIndex ? { ...s, favorite: !s.favorite } : s
      )
    );
    const fav = !songs[activeIndex].favorite;
    showToast(fav ? '已加入收藏 ♥' : '已取消收藏');
  }, [activeIndex, songs, showToast]);

  // 长按菜单处理
  const handleLongPressStart = useCallback(
    (song: Song, e?: React.PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const x = e?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
      const y = e?.clientY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
      setMenuSong(song);
      setMenuPosition({ x, y });
      setMenuVisible(true);
    },
    []
  );

  const handleMenuAction = useCallback(
    (action: LongPressAction) => {
      if (!menuSong) return;
      switch (action) {
        case 'favorite': {
          setSongs((list) =>
            list.map((s) =>
              s.id === menuSong.id ? { ...s, favorite: !s.favorite } : s
            )
          );
          if (menuSong.id === activeSong?.id) {
            // 同步active状态
          }
          showToast(!menuSong.favorite ? '已加入收藏 ♥' : '已取消收藏');
          break;
        }
        case 'next': {
          showToast(`「${menuSong.title}」将在下一首播放`);
          break;
        }
        case 'album': {
          showToast(`打开专辑：${menuSong.album}`);
          break;
        }
        case 'share': {
          showToast(`分享「${menuSong.title}」`);
          break;
        }
      }
      setMenuVisible(false);
    },
    [menuSong, activeSong, showToast]
  );

  // 指针事件：处理拖动旋转、上下滑动切换
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // 如果在菜单可见时、或者在播放器UI/菜单按钮区域内点，不拦截
      if (menuVisible) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-player-ui]') || target.closest('[data-top-bar]')) {
        return;
      }
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        startTime: Date.now(),
        velocityX: 0,
        moved: false,
      };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [menuVisible]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      const d = dragRef.current;
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      const totalDx = e.clientX - d.startX;
      const totalDy = e.clientY - d.startY;

      if (Math.abs(totalDx) > 6 || Math.abs(totalDy) > 6) {
        d.moved = true;
      }

      // 水平拖动 -> 旋转；垂直也叠加少量旋转
      setRotation((r) => r + dx * 0.35 + dy * 0.05);
      d.velocityX = dx * 0.28;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    },
    []
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      d.active = false;

      const totalDx = e.clientX - d.startX;
      const totalDy = e.clientY - d.startY;
      const dt = Date.now() - d.startTime;

      // 快速垂直滑动 -> 切换歌曲
      if (Math.abs(totalDy) > 70 && Math.abs(totalDy) > Math.abs(totalDx) * 1.2 && dt < 600) {
        if (totalDy < 0) {
          handleNext();
          showToast('下一首');
        } else {
          handlePrev();
          showToast('上一首');
        }
        return;
      }

      // 快速水平甩动 -> 保持惯性（已在tick中处理）
      if (dt < 200 && Math.abs(totalDx) > 40) {
        d.velocityX = totalDx * 0.04;
      }
    },
    [handleNext, handlePrev, showToast]
  );

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuVisible) return;
      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
        case 'n':
        case 'N':
          handleNext();
          break;
        case 'ArrowLeft':
        case 'p':
        case 'P':
          handlePrev();
          break;
        case 'ArrowUp':
          setAutoRotateSpeed((s) => Math.min(s + 0.04, 0.4));
          break;
        case 'ArrowDown':
          setAutoRotateSpeed((s) => Math.max(s - 0.04, 0));
          break;
        case 'f':
        case 'F':
          toggleFavorite();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, handleNext, handlePrev, toggleFavorite, menuVisible]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% 30%, #0f172a 0%, #050814 45%, #000000 100%)'
          : 'radial-gradient(ellipse at 50% 25%, #f8fafc 0%, #eef2f7 45%, #e2e8f0 100%)',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 粒子背景 */}
      <ParticleBackground />

      {/* 顶部导航栏 */}
      <div
        data-top-bar
        className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))'
                : 'linear-gradient(135deg, rgba(0,122,255,0.15), rgba(88,86,214,0.15))',
              boxShadow: isDark
                ? 'inset 0 0 0 0.5px rgba(255,255,255,0.1)'
                : 'inset 0 0 0 0.5px rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <span
              className="text-lg font-bold"
              style={{
                color: isDark ? '#93c5fd' : '#007AFF',
              }}
            >
              ♪
            </span>
          </div>
          <div>
            <div
              className="text-sm font-bold"
              style={{ color: isDark ? '#fff' : '#1d1d1f' }}
            >
              星环播放器
            </div>
            <div
              className="text-[11px]"
              style={{
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(60,60,67,0.5)',
              }}
            >
              共 {songs.length} 首 · {isPlaying ? '正在播放' : '已暂停'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShuffleOn((s) => !s)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: shuffleOn
                ? (isDark ? 'rgba(52, 199, 89, 0.18)' : 'rgba(52, 199, 89, 0.12)')
                : 'transparent',
              color: shuffleOn
                ? (isDark ? '#30D158' : '#34C759')
                : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
              backdropFilter: 'blur(15px)',
            }}
            data-player-ui
          >
            <Shuffle size={18} strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setRepeatOn((s) => !s)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: repeatOn
                ? (isDark ? 'rgba(96, 165, 250, 0.18)' : 'rgba(0,122,255,0.12)')
                : 'transparent',
              color: repeatOn
                ? (isDark ? '#60a5fa' : '#007AFF')
                : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
              backdropFilter: 'blur(15px)',
            }}
            data-player-ui
          >
            <Repeat size={18} strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setViewMode((v) => (v === 'orbit' ? 'list' : 'orbit'))}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(15px)',
            }}
            data-player-ui
          >
            <Grid3X3 size={18} strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
              color: isDark ? '#fbbf24' : '#6366f1',
              backdropFilter: 'blur(15px)',
              border: isDark
                ? '0.5px solid rgba(255,255,255,0.08)'
                : '0.5px solid rgba(0,0,0,0.05)',
            }}
            data-player-ui
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* 3D舞台 */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: '1600px',
          perspectiveOrigin: '50% 45%',
        }}
      >
        {/* 轨道环可视（淡） */}
        <div
          className="absolute pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(70deg)',
          }}
        >
          {ORBITS.map((orbit, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              animate={{
                rotateZ: rotation * 0.1,
              }}
              style={{
                width: orbit.radius * 2,
                height: orbit.radius * 2,
                left: -orbit.radius,
                top: -orbit.radius,
                border: isDark
                  ? `0.5px dashed rgba(147, 197, 253, ${0.06 + i * 0.02})`
                  : `0.5px dashed rgba(0, 122, 255, ${0.05 + i * 0.015})`,
                boxShadow: isDark
                  ? `0 0 ${40 + i * 20}px rgba(99, 102, 241, ${0.03 + i * 0.01}) inset`
                  : `none`,
              }}
            />
          ))}
        </div>

        {/* 轨道歌曲（带Y轴倾斜的3D舞台） */}
        <div
          className="absolute"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${60}deg)`,
            width: 0,
            height: 0,
          }}
        >
          {orbitLayout.map((item) => (
            <div
              key={item.song.id}
              style={{
                transformStyle: 'preserve-3d',
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `rotateX(${-60 + item.tiltY - item.tiltY * 2}deg) translateY(${item.tiltY * 2}px)`,
              }}
            >
              <OrbitCard
                song={item.song}
                angle={item.baseAngle}
                radius={item.radius}
                orbitIndex={item.orbitIndex}
                rotationOffset={rotation + item.orbitIndex * 8}
                isActive={item.song.id === activeSong?.id}
                isHovered={hoveredId === item.song.id}
                intensity={intensity}
                onClick={() => switchToSong(item.song.id)}
                onHover={(h) => setHoveredId(h ? item.song.id : null)}
                onLongPressStart={() => handleLongPressStart(item.song)}
                onLongPressEnd={() => {}}
              />
            </div>
          ))}
        </div>

        {/* 中心播放器容器 - 始终位于舞台中央，不参与3D旋转 */}
        <div
          data-player-ui
          className="absolute"
          style={{
            zIndex: 100,
            transform: 'translateZ(200px)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <CenterPlayer
            song={activeSong}
            isPlaying={isPlaying}
            progress={progress}
            intensity={intensity}
            onTogglePlay={togglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            onFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* 底部操作提示条 */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-full flex items-center gap-4 text-xs"
        style={{
          background: isDark
            ? 'rgba(28, 28, 30, 0.6)'
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          border: isDark
            ? '0.5px solid rgba(255,255,255,0.08)'
            : '0.5px solid rgba(0,0,0,0.04)',
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(60,60,67,0.6)',
        }}
        data-player-ui
      >
        <span className="flex items-center gap-1.5">
          <kbd
            className="px-1.5 py-0.5 rounded-md text-[10px]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            }}
          >
            拖动
          </kbd>
          旋转
        </span>
        <span className="opacity-30">·</span>
        <span>
          <kbd
            className="px-1.5 py-0.5 rounded-md text-[10px]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            }}
          >
            上/下滑
          </kbd>
          切歌
        </span>
        <span className="opacity-30">·</span>
        <span>
          <kbd
            className="px-1.5 py-0.5 rounded-md text-[10px]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            }}
          >
            长按
          </kbd>
          更多
        </span>
      </div>

      {/* 提示 Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full"
            style={{
              background: isDark
                ? 'rgba(28, 28, 30, 0.92)'
                : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'saturate(180%) blur(20px)',
              border: isDark
                ? '0.5px solid rgba(255,255,255,0.12)'
                : '0.5px solid rgba(0,0,0,0.06)',
              color: isDark ? '#fff' : '#1d1d1f',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.5)'
                : '0 10px 30px rgba(100,120,150,0.18)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 长按操作菜单 */}
      <LongPressMenu
        song={menuSong}
        visible={menuVisible}
        position={menuPosition}
        onAction={handleMenuAction}
        onClose={() => setMenuVisible(false)}
      />

      {/* 右下角旋转速度指示（调试/彩蛋） */}
      <motion.div
        className="fixed bottom-6 right-6 z-20 px-3 py-1.5 rounded-full text-[11px] font-mono"
        style={{
          background: isDark
            ? 'rgba(28, 28, 30, 0.5)'
            : 'rgba(255, 255, 255, 0.5)',
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(60,60,67,0.4)',
          backdropFilter: 'blur(15px)',
        }}
        data-player-ui
      >
        {Math.round(autoRotateSpeed * 100) / 100}°/f
      </motion.div>
    </div>
  );
}
