'use client';

import { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  size: number;
  life: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const lastPosRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Check if device has cursor
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    let trail: TrailPoint[] = [];

    // Resize canvas
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const lastPos = lastPosRef.current;

      // Calculate velocity for particle size
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = distance / Math.max(now - lastPos.time, 1);

      // Only add particles if moving (avoid static clutter)
      if (distance > 2 && trail.length < 50) {
        const baseSize = Math.min(velocity * 0.5, 4);

        trail.push({
          x: e.clientX,
          y: e.clientY,
          opacity: 0.6,
          size: baseSize + Math.random() * 2,
          life: 1,
        });
      }

      lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
    };

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Update and draw trail points
      trail = trail.filter(point => {
        // Decay life
        point.life -= 0.03;
        point.opacity = point.life * 0.4;
        point.size *= 0.98;

        if (point.life <= 0) return false;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.size * 4
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${point.opacity * 0.6})`);
        gradient.addColorStop(0.4, `rgba(99, 102, 241, ${point.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = `rgba(168, 85, 247, ${point.opacity})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      trailRef.current = trail;
      frameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
