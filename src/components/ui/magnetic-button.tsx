'use client';

import { useMagneticHover } from '@/hooks/use-magnetic-hover';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, forwardedRef) => {
    const magneticRef = useMagneticHover<HTMLButtonElement>(0.25);

    const baseClasses = 'magnetic-button focus-ring inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 shadow-sm hover:shadow-md',
      secondary: 'border border-zinc-800 text-zinc-300 px-5 py-2.5 hover:bg-zinc-900',
      ghost: 'text-zinc-400 hover:text-white px-3 py-1.5',
    };

    return (
      <button
        ref={(node) => {
          magneticRef.current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';
