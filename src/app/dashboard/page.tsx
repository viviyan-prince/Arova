'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LiveShoppers } from '@/components/dashboard/live-shoppers';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import type { AuditEvent } from '@/components/dashboard/activity-feed';
import { useTranslation } from '@/lib/i18n/context';

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting.morning';
  if (hour < 17) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

export default function DashboardPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const t = useTranslation();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const auditRes = await fetch('/api/audit?limit=10');
        if (auditRes.ok) {
          const data = await auditRes.json();
          setEvents(data.events ?? data.data ?? []);
        }
      } catch {
        // Keep defaults
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Greeting + Status */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {t(getGreetingKey())}, SportKart
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your AI-powered store at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />
          <span className="text-xs text-muted-foreground font-medium">
            {t('dashboard.status.live')}
          </span>
        </div>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-3 bg-warning-subtle border border-warning/20 rounded-lg px-4 py-2.5 mb-6">
        <span className="demo-badge">Demo</span>
        <span className="text-xs text-muted-foreground">
          {t('dashboard.demo.banner')}
        </span>
      </div>

      {/* KPI Grid — 2 cols mobile, 5 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          label={t('dashboard.metric.revenue')}
          value={'₹42,800'}
          trend="+18%"
          icon={<RevenueIcon />}
          delay={0}
        />
        <MetricCard
          label={t('dashboard.metric.shoppers')}
          value="127"
          icon={<ShoppersIcon />}
          delay={60}
        />
        <MetricCard
          label={t('dashboard.metric.conversion')}
          value="18.4%"
          icon={<ConversionIcon />}
          delay={120}
        />
        <MetricCard
          label={t('dashboard.metric.orders')}
          value="34"
          icon={<OrdersIcon />}
          delay={180}
        />
        <MetricCard
          label={t('dashboard.metric.aov')}
          value={'₹1,259'}
          icon={<AvgValueIcon />}
          delay={240}
        />
      </div>

      {/* Live Shoppers — full width */}
      <div className="mb-8">
        <LiveShoppers />
      </div>

      {/* Activity Feed */}
      <ActivityFeed realEvents={events.length > 0 ? events : undefined} />
    </div>
  );
}

/* ---------- Icon helpers ---------- */

function RevenueIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ShoppersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function ConversionIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function AvgValueIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    </svg>
  );
}
