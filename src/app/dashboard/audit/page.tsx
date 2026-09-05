'use client';

import { useEffect, useState, useCallback } from 'react';

interface AuditEvent {
  id: string;
  timestamp: string;
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
        setEvents(Array.isArray(data) ? data : data.data ?? []);
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

  function formatTimestamp(ts: string) {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-white">Audit Trail</h2>

        <div className="flex items-center gap-3">
          {/* Event type filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-sm text-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Events</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* AI filter */}
          <select
            value={aiFilter}
            onChange={(e) => setAiFilter(e.target.value as AiFilter)}
            className="bg-gray-900 border border-gray-700 text-sm text-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="ai">AI Only</option>
            <option value="deterministic">Deterministic Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-900 rounded animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No audit events</p>
          <p className="text-sm mt-1">
            Events will appear here as the system processes actions.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Event Type</th>
                <th className="py-3 px-4 font-medium">Processing</th>
                <th className="py-3 px-4 font-medium">AI Model</th>
                <th className="py-3 px-4 font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isExpanded = expandedId === event.id;

                return (
                  <tr key={event.id} className="group">
                    <td colSpan={5} className="p-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : event.id)
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-center border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                          <span className="py-3 px-4 text-gray-400 w-[200px] shrink-0">
                            {formatTimestamp(event.timestamp)}
                          </span>
                          <span className="py-3 px-4 text-white flex-1 min-w-[140px]">
                            {event.event_type}
                          </span>
                          <span className="py-3 px-4 w-[140px] shrink-0">
                            {event.ai_involved ? (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-amber-900/40 text-amber-400">
                                AI
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-emerald-900/40 text-emerald-400">
                                Deterministic
                              </span>
                            )}
                          </span>
                          <span className="py-3 px-4 text-gray-400 w-[140px] shrink-0">
                            {event.ai_model || '--'}
                          </span>
                          <span className="py-3 px-4 text-gray-400 w-[100px] shrink-0">
                            {event.latency_ms != null
                              ? `${event.latency_ms}ms`
                              : '--'}
                          </span>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="bg-gray-900/80 border-b border-gray-800 px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.event_data && (
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                  Event Data
                                </p>
                                <pre className="text-xs text-gray-400 bg-gray-950 rounded p-3 overflow-x-auto max-h-48">
                                  {JSON.stringify(event.event_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {event.ai_input_summary && (
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                  AI Input Summary
                                </p>
                                <p className="text-xs text-gray-300 bg-gray-950 rounded p-3">
                                  {event.ai_input_summary}
                                </p>
                              </div>
                            )}
                            {event.ai_output_summary && (
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                  AI Output Summary
                                </p>
                                <p className="text-xs text-gray-300 bg-gray-950 rounded p-3">
                                  {event.ai_output_summary}
                                </p>
                              </div>
                            )}
                            {event.decision_reasoning && (
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                  Decision Reasoning
                                </p>
                                <p className="text-xs text-gray-300 bg-gray-950 rounded p-3">
                                  {event.decision_reasoning}
                                </p>
                              </div>
                            )}
                            {!event.event_data &&
                              !event.ai_input_summary &&
                              !event.ai_output_summary &&
                              !event.decision_reasoning && (
                                <p className="text-xs text-gray-500 col-span-2">
                                  No additional details for this event.
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
