'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCursorPosition } from '@/hooks/use-cursor-position';
import { MagneticButton } from '@/components/ui/magnetic-button';

interface Stats {
  totalProducts: number;
  totalRules: number;
  activeCategories: string[];
}

interface AuditEvent {
  id: string;
  event_type: string;
  ai_involved: boolean;
  ai_model?: string;
  latency_ms: number;
  decision_reasoning?: string;
  created_at: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [catalogRes, rulesRes, auditRes] = await Promise.allSettled([
          fetch('/api/merchant/catalog'),
          fetch('/api/merchant/rules'),
          fetch('/api/audit?limit=8'),
        ]);

        let totalProducts = 0;
        let activeCategories: string[] = [];
        if (catalogRes.status === 'fulfilled' && catalogRes.value.ok) {
          const data = await catalogRes.value.json();
          const products = data.products ?? data.data ?? [];
          totalProducts = products.length;
          activeCategories = [...new Set(products.map((p: any) => p.category))] as string[];
        }

        let totalRules = 0;
        if (rulesRes.status === 'fulfilled' && rulesRes.value.ok) {
          const data = await rulesRes.value.json();
          totalRules = (data.rules ?? data.data ?? []).length;
        }

        setStats({ totalProducts, totalRules, activeCategories });

        if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
          const data = await auditRes.value.json();
          setEvents(data.events ?? data.data ?? []);
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const aiEvents = events.filter(e => e.ai_involved).length;
  const deterministicEvents = events.length - aiEvents;
  const avgLatency = events.length > 0 ? Math.round(events.reduce((s, e) => s + (e.latency_ms || 0), 0) / events.length) : 0;

  const [prevStats, setPrevStats] = useState<typeof stats>(null);

  useEffect(() => {
    if (stats && !loading) {
      setPrevStats(stats);
    }
  }, [stats, loading]);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Your agent commerce operations at a glance.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <KpiCard
          label="Products"
          value={loading ? null : stats?.totalProducts ?? 0}
          subtitle={`${stats?.activeCategories.length ?? 0} categories`}
          icon={<BoxIcon />}
          delay={0}
          changed={prevStats?.totalProducts !== stats?.totalProducts}
        />
        <KpiCard
          label="Commerce Rules"
          value={loading ? null : stats?.totalRules ?? 0}
          subtitle="Active automations"
          icon={<CogIcon />}
          delay={50}
          changed={prevStats?.totalRules !== stats?.totalRules}
        />
        <KpiCard
          label="Avg Latency"
          value={loading ? null : `${avgLatency}ms`}
          subtitle="Across all steps"
          icon={<BoltIcon />}
          delay={100}
        />
        <KpiCard
          label="AI / Deterministic"
          value={loading ? null : events.length > 0 ? `${aiEvents} / ${deterministicEvents}` : '0 / 0'}
          subtitle="Processing split"
          icon={<ChipIcon />}
          delay={150}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* Agent Protocol Status */}
        <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 cursor-spotlight card-hover">
          <h2 className="text-sm font-semibold text-zinc-200 mb-4">Agent Protocol</h2>
          <div className="space-y-3">
            {[
              { step: 'Discover', desc: 'Merchant capabilities', deterministic: true },
              { step: 'Query', desc: 'Product search', deterministic: false },
              { step: 'Negotiate', desc: 'Price negotiation', deterministic: true },
              { step: 'Checkout', desc: 'Razorpay order', deterministic: true },
              { step: 'Payment', desc: 'Payment link', deterministic: true },
            ].map((s) => (
              <div key={s.step} className="flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0">
                <div>
                  <p className="text-[13px] font-medium text-zinc-200">{s.step}</p>
                  <p className="text-[11px] text-zinc-500">{s.desc}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  s.deterministic
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {s.deterministic ? 'Deterministic' : 'AI Fallback'}
                </span>
              </div>
            ))}
          </div>
          <Link href="/demo">
            <MagneticButton variant="primary" className="mt-4 w-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run Simulation
            </MagneticButton>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 cursor-spotlight card-hover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Recent Activity</h2>
            <Link href="/dashboard/audit" className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-500">No activity yet.</p>
              <p className="text-[12px] text-zinc-600 mt-1">Run a simulation to generate audit events.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {events.slice(0, 6).map((event, idx) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-zinc-800/40 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    event.ai_involved ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                  }`}>
                    {event.ai_involved ? (
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-zinc-200 truncate">
                      {event.event_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {event.decision_reasoning || (event.ai_involved ? `AI: ${event.ai_model}` : 'Deterministic')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] text-zinc-400 font-mono">{event.latency_ms}ms</p>
                    <p className="text-[11px] text-zinc-600">
                      {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, subtitle, icon, delay = 0, changed = false }: {
  label: string;
  value: string | number | null;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
  changed?: boolean;
}) {
  const spotlightRef = useCursorPosition<HTMLDivElement>();
  const prevValueRef = useRef(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== null && value !== prevValueRef.current && prevValueRef.current !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  return (
    <div
      ref={spotlightRef}
      className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 cursor-spotlight card-hover border-transition hover:border-zinc-700/60 stagger-item"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
        <span className="text-zinc-600">{icon}</span>
      </div>
      {value === null ? (
        <div className="skeleton h-8 w-20 mb-1" />
      ) : (
        <p className={`text-2xl font-semibold text-white tracking-tight ${isAnimating ? 'number-animate' : ''}`}>
          {value}
        </p>
      )}
      <p className="text-[12px] text-zinc-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}
