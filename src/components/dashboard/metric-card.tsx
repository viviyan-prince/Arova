'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  icon: ReactNode;
  delay?: number;
}

export function MetricCard({ label, value, subtitle, trend, icon, delay = 0 }: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cursor spotlight tracking
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    };

    el.addEventListener('mousemove', handleMouseMove);
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const trendPositive = trend && trend.startsWith('+');

  return (
    <div
      ref={cardRef}
      className="metric-card cursor-spotlight bg-surface border border-border rounded-xl p-5 card-hover stagger-item"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted">{icon}</span>
      </div>
      <div
        className={`flex items-baseline gap-2 ${mounted ? 'animate-count-up' : 'opacity-0'}`}
        style={{ animationDelay: `${delay + 100}ms` }}
      >
        <p className="metric-value text-2xl font-semibold text-white font-mono tracking-tight">{value}</p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trendPositive ? 'text-revenue' : 'text-error'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
