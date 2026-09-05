'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

const navItems = [
  { href: '/dashboard', labelKey: 'nav.home', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  { href: '/dashboard/catalog', labelKey: 'nav.products', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' },
  { href: '/dashboard/ai-sales', labelKey: 'nav.aiSales', icon: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941' },
  { href: '/dashboard/rules', labelKey: 'nav.rules', icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75' },
  { href: '/dashboard/guardrails', labelKey: 'nav.guardrails', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { href: '/dashboard/insights', labelKey: 'nav.insights', icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' },
  { href: '/dashboard/activity', labelKey: 'nav.activity', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const simulateItem = {
  href: '/demo',
  labelKey: 'nav.aiShopper',
  icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z',
};

function NavLink({ href, label, icon, isActive }: { href: string; label: string; icon: string; isActive: boolean; }) {
  return (
    <Link
      href={href}
      className={`nav-item group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium focus-ring relative ${
        isActive ? 'active bg-accent-subtle text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <svg
        className={`nav-icon w-[18px] h-[18px] shrink-0 ${
          isActive ? 'text-accent' : 'text-muted group-hover:text-muted-foreground'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const sidebarContent = (
    <>
      {/* Brand + Merchant */}
      <div className="px-5 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-[15px] font-semibold text-foreground tracking-tight">Arova</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
            SK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">SportKart India</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />
              <span className="text-[11px] text-muted">AI Store Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={t(item.labelKey)} icon={item.icon} isActive={isActive(item.href)} />
        ))}

        <div className="pt-3 mt-3 border-t border-border">
          <NavLink
            href={simulateItem.href}
            label={t(simulateItem.labelKey)}
            icon={simulateItem.icon}
            isActive={pathname.startsWith('/demo')}
          />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border space-y-2">
        <LanguageSwitcher />
        <span className="demo-badge">{t('common.razorpayTest')}</span>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-surface border border-border lg:hidden"
        aria-label="Open navigation"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-background border-r border-border flex flex-col animate-slide-in">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
              aria-label="Close navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] min-h-screen bg-background border-r border-border flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
