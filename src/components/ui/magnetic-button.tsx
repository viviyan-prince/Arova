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

    const baseClasses = 'magnetic-button premium-button focus-ring inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-accent hover:bg-accent-hover text-white px-5 py-2.5 shadow-sm',
      secondary: 'border border-border text-muted-foreground px-5 py-2.5 hover:bg-surface hover:text-foreground hover:border-accent',
      ghost: 'text-muted-foreground hover:text-foreground px-3 py-1.5 hover:bg-surface-hover',
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
