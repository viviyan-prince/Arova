'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { languages } from '@/lib/i18n/languages';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors focus-ring"
        aria-label="Change language"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
        </svg>
        {compact ? current.code.toUpperCase() : current.nativeName}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className={`absolute ${compact ? 'top-full mt-1 right-0' : 'bottom-full mb-1 left-0'} w-44 bg-surface border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in z-50`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors ${
                lang.code === language
                  ? 'bg-accent-subtle text-accent font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-raised'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="text-muted text-[11px]">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
