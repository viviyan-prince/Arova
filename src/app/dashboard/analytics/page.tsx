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

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="max-w-5xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">AI vs deterministic processing insights.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">
          AI vs deterministic processing across your agent commerce pipeline.
        </p>
      </div>

      {totalEvents === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-300">No analytics data yet</p>
          <p className="text-[12px] text-zinc-500 mt-1">Run a simulation to generate processing events.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Events" value={totalEvents} />
            <KpiCard label="AI Events" value={aiEvents} accent="amber" />
            <KpiCard label="Deterministic" value={deterministicEvents} accent="emerald" />
            <KpiCard label="Avg Latency" value={`${avgLatency}ms`} mono />
          </div>

          {/* Processing Split + Trust Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI vs Deterministic */}
            <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-zinc-200 mb-5">Processing Split</h2>

              <div className="flex items-baseline gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] text-zinc-500">Deterministic</span>
                  <span className="text-xl font-semibold text-white">{deterministicPercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-[12px] text-zinc-500">AI</span>
                  <span className="text-xl font-semibold text-white">{aiPercent}%</span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${deterministicPercent}%` }}
                />
                <div
                  className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-zinc-600">
                <span>{deterministicEvents} events</span>
                <span>{aiEvents} events</span>
              </div>

              <p className="text-[11px] text-zinc-600 mt-4 leading-relaxed">
                Arova keeps money operations deterministic. AI is used only for semantic search, catalog generation, and buyer agent reasoning.
              </p>
            </div>

            {/* Trust Score */}
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 flex flex-col">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4">Trust Score</h2>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 mb-3">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#27272a" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={trustScore >= 80 ? '#22c55e' : trustScore >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(trustScore / 100) * 327} 327`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{trustScore}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                  Based on deterministic ratio and response latency.
                </p>
              </div>
            </div>
          </div>

          {/* Latency by Step Type */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">Latency by Step Type</h2>
            {latencyStats.length === 0 ? (
              <p className="text-[12px] text-zinc-600">No latency data recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {latencyStats.map((stat, idx) => (
                  <div key={stat.type} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-zinc-300">{stat.type.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-zinc-500">
                          {stat.count} call{stat.count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[13px] font-mono font-medium text-zinc-200 w-16 text-right">
                          {stat.avg}ms
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
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
  );
}

function KpiCard({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string | number;
  accent?: 'amber' | 'emerald';
  mono?: boolean;
}) {
  const valueColor = accent === 'amber'
    ? 'text-amber-400'
    : accent === 'emerald'
      ? 'text-emerald-400'
      : 'text-white';

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-semibold tracking-tight ${valueColor} ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}
