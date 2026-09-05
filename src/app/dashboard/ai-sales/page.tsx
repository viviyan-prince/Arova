'use client';

import { useEffect, useState } from 'react';

interface AuditEvent {
  ai_involved: boolean;
  latency_ms?: number | null;
  event_type?: string;
}

interface LatencyStat {
  type: string;
  avg: number;
  count: number;
}

export default function AiSalesPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/audit');
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : data.events ?? data.data ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalEvents = events.length;
  const aiEvents = events.filter((e) => e.ai_involved).length;
  const deterministicEvents = totalEvents - aiEvents;
  const aiPercent = totalEvents > 0 ? Math.round((aiEvents / totalEvents) * 100) : 0;
  const deterministicPercent = 100 - aiPercent;

  const latencyByType: Record<string, { total: number; count: number }> = {};
  for (const event of events) {
    const t = event.event_type || 'unknown';
    if (event.latency_ms != null) {
      if (!latencyByType[t]) latencyByType[t] = { total: 0, count: 0 };
      latencyByType[t].total += event.latency_ms;
      latencyByType[t].count += 1;
    }
  }
  const latencyStats: LatencyStat[] = Object.entries(latencyByType)
    .map(([type, { total, count }]) => ({
      type,
      avg: Math.round(total / count),
      count,
    }))
    .sort((a, b) => b.avg - a.avg);

  const maxLatency = latencyStats.length > 0 ? Math.max(...latencyStats.map((s) => s.avg)) : 1;

  const eventsWithLatency = events.filter((e) => e.latency_ms != null);
  const avgLatency =
    eventsWithLatency.length > 0
      ? Math.round(eventsWithLatency.reduce((sum, e) => sum + (e.latency_ms ?? 0), 0) / eventsWithLatency.length)
      : 0;

  const trustScore = Math.min(
    100,
    Math.round(deterministicPercent * 0.7 + Math.max(0, 100 - avgLatency / 10) * 0.3),
  );

  const kpis = [
    { label: 'AI Revenue', value: '₹42,800', accent: true },
    { label: 'AI Shoppers', value: '127', accent: false },
    { label: 'AI Orders', value: '34', accent: false },
    { label: 'Conversion', value: '18.4%', accent: true },
    { label: 'Avg Discount', value: '12%', accent: false },
    { label: 'Avg Order Value', value: '₹1,259', accent: false },
  ];

  const categories = [
    { name: 'Footwear', percent: 45 },
    { name: 'Accessories', percent: 30 },
    { name: 'Apparel', percent: 25 },
  ];

  const queries = [
    'Running shoes under ₹5,000',
    'Best gym gloves for beginners',
    'Can you give me a discount?',
    'Do you have waterproof bottles?',
  ];

  if (loading) {
    return (
      <div className="max-w-5xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue and activity from AI shoppers.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI Sales</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue and activity from AI shoppers.</p>
      </div>

      {/* Demo banner */}
      <div className="mb-6 px-4 py-2.5 rounded-lg bg-warning-subtle border border-warning/20 flex items-center gap-2">
        <span className="demo-badge">Demo</span>
        <span className="text-[12px] text-warning">Demo data — revenue figures are simulated</span>
      </div>

      {/* Revenue KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="metric-card bg-surface border border-border rounded-xl p-4">
            <p className="text-[11px] font-medium text-muted-foreground tracking-wide mb-2">{kpi.label}</p>
            <p className={`text-xl font-semibold tracking-tight ${kpi.accent ? 'text-revenue' : 'text-foreground'}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* What AI shoppers are buying */}
        <div className="premium-card chart-enter bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-5">What AI shoppers are buying</h2>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-foreground/80">{cat.name}</span>
                  <span className="text-[13px] font-mono font-medium text-foreground">{cat.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-raised rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-4">Based on simulated AI shopper orders</p>
        </div>

        {/* What AI shoppers are asking for */}
        <div className="premium-card ai-indicator bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-5">What AI shoppers are asking for</h2>
          <div className="space-y-2.5">
            {queries.map((query, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-raised border border-border-subtle animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <svg className="w-4 h-4 text-ai shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                <span className="text-[13px] text-foreground/80">&ldquo;{query}&rdquo;</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-4">Sample queries from simulated AI shoppers</p>
        </div>
      </div>

      {/* Expandable Processing details */}
      <div className="premium-card ai-indicator bg-surface border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-raised/30 transition-colors"
        >
          <h2 className="text-sm font-semibold text-foreground">Processing details</h2>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {detailsOpen && (
          <div className="px-5 pb-5 border-t border-border animate-fade-in">
            {totalEvents === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-foreground/80">No processing data yet</p>
                <p className="text-[12px] text-muted-foreground mt-1">Run a simulation to generate processing events.</p>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {/* KPI summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-raised rounded-lg p-3">
                    <p className="text-[11px] font-medium text-muted-foreground tracking-wide mb-1">Total events</p>
                    <p className="text-lg font-semibold text-foreground">{totalEvents}</p>
                  </div>
                  <div className="bg-surface-raised rounded-lg p-3">
                    <p className="text-[11px] font-medium text-muted-foreground tracking-wide mb-1">AI events</p>
                    <p className="text-lg font-semibold text-ai">{aiEvents}</p>
                  </div>
                  <div className="bg-surface-raised rounded-lg p-3">
                    <p className="text-[11px] font-medium text-muted-foreground tracking-wide mb-1">Deterministic</p>
                    <p className="text-lg font-semibold text-deterministic">{deterministicEvents}</p>
                  </div>
                  <div className="bg-surface-raised rounded-lg p-3">
                    <p className="text-[11px] font-medium text-muted-foreground tracking-wide mb-1">Avg latency</p>
                    <p className="text-lg font-semibold font-mono text-foreground">{avgLatency}ms</p>
                  </div>
                </div>

                {/* Processing Split + Trust Score */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI vs Deterministic */}
                  <div className="lg:col-span-2">
                    <h3 className="text-[13px] font-semibold text-foreground mb-4">Processing split</h3>

                    <div className="flex items-baseline gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-deterministic" />
                        <span className="text-[12px] text-muted-foreground">Deterministic</span>
                        <span className="text-xl font-semibold text-foreground">{deterministicPercent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-ai" />
                        <span className="text-[12px] text-muted-foreground">AI</span>
                        <span className="text-xl font-semibold text-foreground">{aiPercent}%</span>
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="w-full h-3 bg-surface-raised rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-deterministic transition-all duration-700 ease-out"
                        style={{ width: `${deterministicPercent}%` }}
                      />
                      <div
                        className="h-full bg-ai transition-all duration-700 ease-out"
                        style={{ width: `${aiPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[11px] text-muted">
                      <span>{deterministicEvents} events</span>
                      <span>{aiEvents} events</span>
                    </div>

                    <p className="text-[11px] text-muted mt-4 leading-relaxed">
                      Arova keeps money operations deterministic. AI is used only for semantic search, catalog generation, and buyer agent reasoning.
                    </p>
                  </div>

                  {/* Trust Score */}
                  <div className="flex flex-col">
                    <h3 className="text-[13px] font-semibold text-foreground mb-4">Trust score</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="relative w-28 h-28 mb-3">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="#25252D" strokeWidth="8" />
                          <circle
                            cx="60" cy="60" r="52" fill="none"
                            stroke={trustScore >= 80 ? '#34D399' : trustScore >= 50 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(trustScore / 100) * 327} 327`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-foreground">{trustScore}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                        Based on deterministic ratio and response latency.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Latency by Step Type */}
                <div>
                  <h3 className="text-[13px] font-semibold text-foreground mb-4">Latency by step type</h3>
                  {latencyStats.length === 0 ? (
                    <p className="text-[12px] text-muted">No latency data recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {latencyStats.map((stat, idx) => (
                        <div key={stat.type} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] text-foreground/80">{stat.type.replace(/_/g, ' ')}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[12px] text-muted-foreground">
                                {stat.count} call{stat.count !== 1 ? 's' : ''}
                              </span>
                              <span className="text-[13px] font-mono font-medium text-foreground w-16 text-right">
                                {stat.avg}ms
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-surface-raised rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                              style={{ width: `${Math.max(4, (stat.avg / maxLatency) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
