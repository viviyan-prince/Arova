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
          setEvents(Array.isArray(data) ? data : data.data ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute AI vs Deterministic ratio
  const totalEvents = events.length;
  const aiEvents = events.filter((e) => e.ai_involved).length;
  const deterministicEvents = totalEvents - aiEvents;
  const aiPercent = totalEvents > 0 ? Math.round((aiEvents / totalEvents) * 100) : 0;
  const deterministicPercent = 100 - aiPercent;

  // Compute average latency by event type
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

  // Trust score distribution (simulated from deterministic ratio + latency)
  const avgLatency =
    events.reduce((sum, e) => sum + (e.latency_ms ?? 0), 0) /
    Math.max(events.filter((e) => e.latency_ms != null).length, 1);
  const trustScore = Math.min(
    100,
    Math.round(deterministicPercent * 0.7 + Math.max(0, 100 - avgLatency / 10) * 0.3),
  );

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Analytics</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Analytics</h2>

      {totalEvents === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No data yet</p>
          <p className="text-sm mt-1">
            Analytics will populate as events are logged.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI vs Deterministic Ratio */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              AI vs Deterministic Processing
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-2xl font-bold text-white">
                {deterministicPercent}%
              </span>
              <span className="text-sm text-gray-400">Deterministic</span>
              <span className="text-gray-600 mx-1">|</span>
              <span className="text-2xl font-bold text-white">
                {aiPercent}%
              </span>
              <span className="text-sm text-gray-400">AI</span>
            </div>
            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${deterministicPercent}%` }}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${aiPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>
                {deterministicEvents} deterministic event
                {deterministicEvents !== 1 ? 's' : ''}
              </span>
              <span>
                {aiEvents} AI event{aiEvents !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Average Latency by Step Type */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Average Latency by Step Type
            </h3>
            {latencyStats.length === 0 ? (
              <p className="text-sm text-gray-500">
                No latency data recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {latencyStats.map((stat) => (
                  <div key={stat.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-300">{stat.type}</span>
                      <span className="text-gray-400">
                        {stat.avg}ms
                        <span className="text-gray-600 ml-1">
                          ({stat.count} call{stat.count !== 1 ? 's' : ''})
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, (stat.avg / maxLatency) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Score */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Trust Score Distribution
            </h3>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-4xl font-bold text-white">{trustScore}</p>
                <p className="text-xs text-gray-500 mt-1">out of 100</p>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      trustScore >= 80
                        ? 'bg-emerald-500'
                        : trustScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Computed from deterministic processing ratio (70% weight) and
              response latency (30% weight). Higher scores indicate more
              predictable, auditable behavior.
            </p>
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
              <p className="text-2xl font-bold text-white">{totalEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Total Events</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
              <p className="text-2xl font-bold text-white">
                {Math.round(avgLatency)}ms
              </p>
              <p className="text-xs text-gray-500 mt-1">Avg Latency</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
              <p className="text-2xl font-bold text-white">
                {latencyStats.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Step Types</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
