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
type ViewMode = 'merchant' | 'technical';

const EVENT_DESCRIPTIONS: Record<string, string> = {
  DISCOVERY: 'AI shopper discovered your store',
  QUERY: 'Products searched',
  NEGOTIATION_STEP: 'Price negotiation',
  CHECKOUT: 'Order created',
  PAYMENT_SUCCESS: 'Payment completed',
  CATALOG_GENERATED: 'Product AI description updated',
  RULE_COMPILED: 'Selling rule activated',
};

function friendlyDescription(eventType: string): string {
  return EVENT_DESCRIPTIONS[eventType] || eventType.replace(/_/g, ' ');
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

function formatTimeShort(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function ActivityPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState<AiFilter>('all');
  const [view, setView] = useState<ViewMode>('merchant');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
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
    fetchEvents();
  }, [fetchEvents]);

  const eventTypes = Array.from(new Set(events.map((e) => e.event_type)));

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Everything Arova has done
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track AI shopping activity and system events.
        </p>
      </div>

      {/* Tabs + Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* View tabs */}
        <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setView('merchant')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors focus-ring ${
              view === 'merchant'
                ? 'bg-accent text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            What happened
          </button>
          <button
            type="button"
            onClick={() => setView('technical')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors focus-ring ${
              view === 'technical'
                ? 'bg-accent text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Technical details
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="h-8 bg-surface border border-border text-xs text-muted-foreground rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
          >
            <option value="all">All events</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {friendlyDescription(t)}
              </option>
            ))}
          </select>
          <select
            value={aiFilter}
            onChange={(e) => setAiFilter(e.target.value as AiFilter)}
            className="h-8 bg-surface border border-border text-xs text-muted-foreground rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
          >
            <option value="all">All processing</option>
            <option value="ai">AI only</option>
            <option value="deterministic">Deterministic only</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : events.length === 0 ? (
        <EmptyState />
      ) : view === 'merchant' ? (
        <MerchantView events={events} />
      ) : (
        <TechnicalView
          events={events}
          expandedId={expandedId}
          onToggle={(id) =>
            setExpandedId(expandedId === id ? null : id)
          }
        />
      )}
    </div>
  );
}

/* ---------- Merchant View ---------- */

function MerchantView({ events }: { events: AuditEvent[] }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-4 bottom-4 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, idx) => (
          <div
            key={event.id}
            className="interactive-row flex items-start gap-3 animate-timeline-enter stagger-item"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Dot */}
            <div
              className={`w-[15px] h-[15px] rounded-full border-2 shrink-0 mt-0.5 relative z-10 ${
                event.ai_involved
                  ? 'border-ai bg-ai-subtle'
                  : 'border-deterministic bg-deterministic-subtle'
              }`}
            />

            {/* Card */}
            <div className="flex-1 bg-surface border border-border rounded-lg p-4 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-sm text-foreground">
                  {friendlyDescription(event.event_type)}
                </p>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                    event.ai_involved
                      ? 'bg-ai-subtle text-ai'
                      : 'bg-deterministic-subtle text-deterministic'
                  }`}
                >
                  {event.ai_involved ? 'AI' : 'Deterministic'}
                </span>
              </div>
              {event.decision_reasoning && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                  {event.decision_reasoning}
                </p>
              )}
              <span className="text-[11px] text-muted">
                {formatTime(event.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Technical View ---------- */

function TechnicalView({
  events,
  expandedId,
  onToggle,
}: {
  events: AuditEvent[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="cursor-spotlight bg-surface border border-border rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[160px_1fr_100px_120px_80px] px-5 py-2.5 border-b border-border text-[11px] font-medium text-muted uppercase tracking-wider">
        <span>Time</span>
        <span>Event</span>
        <span>Processing</span>
        <span>Model</span>
        <span className="text-right">Latency</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-subtle">
        {events.map((event, idx) => {
          const isExpanded = expandedId === event.id;
          const hasDetails =
            event.event_data ||
            event.ai_input_summary ||
            event.ai_output_summary ||
            event.decision_reasoning;

          return (
            <div
              key={event.id}
              className="table-row animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <button
                type="button"
                onClick={() => hasDetails && onToggle(event.id)}
                className={`w-full grid grid-cols-[160px_1fr_100px_120px_80px] items-center px-5 py-3 text-left transition-colors ${
                  hasDetails
                    ? 'hover:bg-surface-hover cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <span className="text-xs text-muted font-mono">
                  {formatTime(event.created_at)}
                </span>
                <span className="text-xs text-foreground truncate pr-4">
                  {event.event_type.replace(/_/g, ' ')}
                </span>
                <span>
                  {event.ai_involved ? (
                    <span className="bg-ai-subtle text-ai text-[11px] font-medium px-2 py-0.5 rounded-full">
                      AI
                    </span>
                  ) : (
                    <span className="bg-deterministic-subtle text-deterministic text-[11px] font-medium px-2 py-0.5 rounded-full">
                      Det
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted truncate">
                  {event.ai_model || '—'}
                </span>
                <span className="text-xs text-muted-foreground font-mono text-right flex items-center justify-end gap-1.5">
                  {event.latency_ms != null
                    ? `${event.latency_ms}ms`
                    : '—'}
                  {hasDetails && (
                    <svg
                      className={`w-3 h-3 text-muted transition-transform duration-150 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  )}
                </span>
              </button>

              {/* Expanded detail */}
              {isExpanded && hasDetails && (
                <div className="px-5 pb-4 pt-1 animate-fade-in">
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.event_data && (
                        <DetailBlock label="Event data">
                          <pre className="text-xs text-muted-foreground font-mono bg-surface rounded-md p-3 overflow-x-auto max-h-48 leading-relaxed">
                            {JSON.stringify(event.event_data, null, 2)}
                          </pre>
                        </DetailBlock>
                      )}
                      {event.decision_reasoning && (
                        <DetailBlock label="Decision reasoning">
                          <p className="text-xs text-foreground leading-relaxed">
                            {event.decision_reasoning}
                          </p>
                        </DetailBlock>
                      )}
                      {event.ai_input_summary && (
                        <DetailBlock label="AI input">
                          <p className="text-xs text-foreground leading-relaxed">
                            {event.ai_input_summary}
                          </p>
                        </DetailBlock>
                      )}
                      {event.ai_output_summary && (
                        <DetailBlock label="AI output">
                          <p className="text-xs text-foreground leading-relaxed">
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
  );
}

/* ---------- Shared helpers ---------- */

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="divide-y divide-border-subtle">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-6">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-14 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface border border-border rounded-xl py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">No activity events found</p>
      <p className="text-xs text-muted mt-1">
        Events will appear here as the system processes actions.
      </p>
    </div>
  );
}
