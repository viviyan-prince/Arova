'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  angle: number;
  distance: number;
  orbitSpeed: number;
  layer: number;
}

export function CinematicParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const frameRef = useRef<number | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Responsive particle count
    const getParticleCount = () => {
      const width = window.innerWidth;
      if (width < 768) return prefersReducedMotion ? 80 : 120;
      if (width < 1024) return prefersReducedMotion ? 150 : 200;
      return prefersReducedMotion ? 200 : 300;
    };

    let particles: Particle[] = [];
    let animationPhase = 0;
    let time = 0;

    // Resize canvas
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    // Initialize particles in orbital structure
    const initParticles = () => {
      particles = [];
      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;
      const count = getParticleCount();

      for (let i = 0; i < count; i++) {
        const layer = Math.floor(Math.random() * 3);
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 400 + layer * 100;

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance * 0.6; // Elliptical

        particles.push({
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size: (0.5 + Math.random() * 1.5) * (layer === 0 ? 1.5 : 1),
          opacity: 0,
          angle: angle,
          distance: distance,
          orbitSpeed: (0.02 + Math.random() * 0.03) * (layer === 0 ? 0.5 : 1),
          layer: layer,
        });
      }

      particlesRef.current = particles;
    };

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    // Smooth mouse position
    const updateMousePosition = () => {
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;
    };

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouse = mouseRef.current;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      time += 0.002;
      if (!prefersReducedMotion) {
        animationPhase = Math.min(animationPhase + 0.008, 1);
      } else {
        animationPhase = 1;
      }

      updateMousePosition();

      // Draw central intelligence node
      if (animationPhase > 0.3) {
        const coreOpacity = Math.min((animationPhase - 0.3) * 2, 0.15);
        const pulseSize = 40 + Math.sin(time * 2) * 4;

        // Outer glow
        const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 3);
        glow.addColorStop(0, `rgba(99, 102, 241, ${coreOpacity * 0.3})`);
        glow.addColorStop(0.5, `rgba(139, 92, 246, ${coreOpacity * 0.1})`);
        glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(centerX - pulseSize * 3, centerY - pulseSize * 3, pulseSize * 6, pulseSize * 6);

        // Core
        const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        core.addColorStop(0, `rgba(139, 92, 246, ${coreOpacity})`);
        core.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Orbital motion
        if (!prefersReducedMotion && animationPhase > 0.5) {
          particle.angle += particle.orbitSpeed * 0.3;
          particle.baseX = centerX + Math.cos(particle.angle) * particle.distance;
          particle.baseY = centerY + Math.sin(particle.angle) * particle.distance * 0.6;
        }

        // Cursor interaction - subtle attraction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;

        if (dist < interactionRadius && mouse.x > 0) {
          const force = (1 - dist / interactionRadius) * 0.3;
          particle.vx += dx * force * 0.01;
          particle.vy += dy * force * 0.01;
        }

        // Return to base position
        particle.vx += (particle.baseX - particle.x) * 0.01;
        particle.vy += (particle.baseY - particle.y) * 0.01;

        // Damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Fade in during intro
        const targetOpacity = animationPhase * (0.2 + (1 - particle.layer / 3) * 0.6);
        particle.opacity += (targetOpacity - particle.opacity) * 0.05;

        // Enhanced brightness near cursor
        let brightness = particle.opacity;
        if (dist < interactionRadius && mouse.x > 0) {
          brightness += (1 - dist / interactionRadius) * 0.4;
        }

        // Draw particle
        const baseColor = particle.layer === 0 ? '168, 85, 247' : '99, 102, 241'; // Purple or indigo
        ctx.fillStyle = `rgba(${baseColor}, ${Math.min(brightness, 1)})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections to nearby particles
        if (animationPhase > 0.7 && i % 3 === 0) {
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const pdx = other.x - particle.x;
            const pdy = other.y - particle.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pdist < 80 && Math.random() > 0.95) {
              const opacity = (1 - pdist / 80) * 0.1 * animationPhase;
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    initParticles();

    // Delay animation start for intro effect
    setTimeout(() => {
      setIsLoaded(true);
      animate();
    }, 300);

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

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
      className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
