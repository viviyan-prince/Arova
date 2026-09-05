'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNav = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    href: '/dashboard/catalog',
    label: 'Products',
    icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  },
  {
    href: '/dashboard/rules',
    label: 'Rules',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

const insightNav = [
  {
    href: '/dashboard/audit',
    label: 'Audit Trail',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
];

function NavLink({ item, isActive }: { item: typeof mainNav[0]; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 focus-ring ${
        isActive
          ? 'bg-white/[0.08] text-white'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
      }`}
    >
      <svg
        className={`w-[18px] h-[18px] shrink-0 transition-all duration-150 ${
          isActive ? 'text-indigo-400' : 'group-hover:translate-x-0.5'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
      </svg>
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="w-[240px] min-h-screen bg-zinc-950 border-r border-zinc-800/60 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 h-14 flex items-center border-b border-zinc-800/60">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">Arova</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6">
        <div className="space-y-0.5">
          <p className="px-3 pb-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Commerce
          </p>
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        <div className="space-y-0.5">
          <p className="px-3 pb-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Intelligence
          </p>
          {insightNav.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        {/* Demo link */}
        <div className="space-y-0.5">
          <p className="px-3 pb-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Simulate
          </p>
          <Link
            href="/demo"
            className="group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all duration-150 focus-ring"
          >
            <svg className="w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Buyer Agent Demo
          </Link>
        </div>
      </div>

      {/* Merchant Info */}
      <div className="px-4 py-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
            SK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-zinc-200 truncate">SportKart India</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-pulse" />
              <span className="text-[11px] text-zinc-500">Razorpay Test</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
