import { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  hue: number;
  twinkle: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      initParticles();
    };

    const initParticles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random(),
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        hue: Math.random() * 60 + 200,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      // 深色模式：星空效果
      // 浅色模式：柔和光斑效果
      particles.forEach((p) => {
        p.twinkle += 0.02;
        const alpha = (0.4 + Math.sin(p.twinkle) * 0.3) * (isDark ? 1 : 0.6);
        const size = p.size * (isDark ? 1 : 1.5) * p.z;

        if (isDark) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
          gradient.addColorStop(0, `hsla(${p.hue}, 80%, 85%, ${alpha})`);
          gradient.addColorStop(0.5, `hsla(${p.hue}, 60%, 60%, ${alpha * 0.4})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 50%, 50%, 0)`);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = `hsla(220, 25%, 60%, ${alpha})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, isDark ? size * 2 : size, 0, Math.PI * 2);
        ctx.fill();

        // 缓慢漂移
        p.y -= p.speed * p.z;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });

      // 绘制连接线条（少量）
      if (isDark) {
        ctx.strokeStyle = 'rgba(150, 180, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < Math.min(particles.length, 80); i++) {
          for (let j = i + 1; j < Math.min(particles.length, 80); j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 * window.devicePixelRatio) {
              ctx.globalAlpha = (1 - dist / (100 * window.devicePixelRatio)) * 0.3;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
