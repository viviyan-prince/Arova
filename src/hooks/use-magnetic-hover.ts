'use client';

import { useEffect, useRef } from 'react';

export function useMagneticHover<T extends HTMLElement>(strength: number = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;

      element.style.setProperty('--magnetic-x', `${deltaX * strength}`);
      element.style.setProperty('--magnetic-y', `${deltaY * strength}`);
    };

    const handleMouseLeave = () => {
      element.style.setProperty('--magnetic-x', '0');
      element.style.setProperty('--magnetic-y', '0');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}
