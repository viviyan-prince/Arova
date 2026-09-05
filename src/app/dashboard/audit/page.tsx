'use client';

import { useEffect, useState, useCallback } from 'react';

interface AuditEvent {
  id: string;
  created_at: string;
  event_type: string;
  ai_involved: boolean;
  ai_model?: string | null;
  latency_ms?: number | null;
  event_data?: Record<string, unknown> | null;
  ai_input_summary?: string | null;
  ai_output_summary?: string | null;
  decision_reasoning?: string | null;
}

type AiFilter = 'all' | 'ai' | 'deterministic';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [aiFilter, setAiFilter] = useState<AiFilter>('all');

  const fetchAudit = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (eventTypeFilter !== 'all') params.set('event_type', eventTypeFilter);
      if (aiFilter === 'ai') params.set('ai_involved', 'true');
      if (aiFilter === 'deterministic') params.set('ai_involved', 'false');

      const url = `/api/audit${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data.events ?? data.data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter, aiFilter]);

  useEffect(() => {
    setLoading(true);
    fetchAudit();
  }, [fetchAudit]);

  const eventTypes = Array.from(new Set(events.map((e) => e.event_type)));

  function formatTime(ts: string) {
    try {
      const d = new Date(ts);
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  }

  function formatEventType(t: string) {
    return t.replace(/_/g, ' ');
  }

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Audit Trail</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Every action logged with AI-involvement flags and decision reasoning.
            {!loading && events.length > 0 && (
              <span className="ml-1 text-zinc-400">{events.length} events</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="h-9 bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-300 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
          >
            <option value="all">All Events</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{formatEventType(t)}</option>
            ))}
          </select>

          <select
            value={aiFilter}
            onChange={(e) => setAiFilter(e.target.value as AiFilter)}
            className="h-9 bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-300 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
          >
            <option value="all">All Processing</option>
            <option value="ai">AI Only</option>
            <option value="deterministic">Deterministic Only</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60">
            <div className="skeleton h-4 w-48" />
          </div>
          <div className="divide-y divide-zinc-800/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-6">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-5 w-20 rounded-full" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-[13px] text-zinc-400">No audit events found</p>
          <p className="text-[12px] text-zinc-600 mt-1">
            Events will appear here as the system processes actions.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[180px_1fr_120px_140px_90px] px-5 py-2.5 border-b border-zinc-800/60 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            <span>Time</span>
            <span>Event</span>
            <span>Processing</span>
            <span>Model</span>
            <span className="text-right">Latency</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-800/40">
            {events.map((event, idx) => {
              const isExpanded = expandedId === event.id;
              const hasDetails =
                event.event_data ||
                event.ai_input_summary ||
                event.ai_output_summary ||
                event.decision_reasoning;

              return (
                <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="w-full grid grid-cols-[180px_1fr_120px_140px_90px] items-center px-5 py-3 text-left hover:bg-zinc-800/30 transition-colors group"
                  >
                    <span className="text-[12px] text-zinc-500 font-mono">
                      {formatTime(event.created_at)}
                    </span>
                    <span className="text-[13px] text-zinc-200 truncate pr-4">
                      {formatEventType(event.event_type)}
                    </span>
                    <span>
                      {event.ai_involved ? (
                        <span className="bg-amber-500/10 text-amber-400 text-[11px] font-medium px-2 py-0.5 rounded-full">
                          AI
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-medium px-2 py-0.5 rounded-full">
                          Deterministic
                        </span>
                      )}
                    </span>
                    <span className="text-[12px] text-zinc-500 truncate">
                      {event.ai_model || <span className="text-zinc-700">&mdash;</span>}
                    </span>
                    <span className="text-[12px] text-zinc-400 font-mono text-right flex items-center justify-end gap-1.5">
                      {event.latency_ms != null ? `${event.latency_ms}ms` : <span className="text-zinc-700">&mdash;</span>}
                      {hasDetails && (
                        <svg
                          className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && hasDetails && (
                    <div className="px-5 pb-4 pt-1 animate-fade-in">
                      <div className="bg-zinc-950/60 border border-zinc-800/40 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {event.event_data && (
                            <DetailBlock label="Event Data">
                              <pre className="text-[12px] text-zinc-400 font-mono bg-zinc-900/80 rounded-md p-3 overflow-x-auto max-h-48 leading-relaxed">
                                {JSON.stringify(event.event_data, null, 2)}
                              </pre>
                            </DetailBlock>
                          )}
                          {event.decision_reasoning && (
                            <DetailBlock label="Decision Reasoning">
                              <p className="text-[12px] text-zinc-300 leading-relaxed">
                                {event.decision_reasoning}
                              </p>
                            </DetailBlock>
                          )}
                          {event.ai_input_summary && (
                            <DetailBlock label="AI Input">
                              <p className="text-[12px] text-zinc-300 leading-relaxed">
                                {event.ai_input_summary}
                              </p>
                            </DetailBlock>
                          )}
                          {event.ai_output_summary && (
                            <DetailBlock label="AI Output">
                              <p className="text-[12px] text-zinc-300 leading-relaxed">
                                {event.ai_output_summary}
                              </p>
                            </DetailBlock>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}
