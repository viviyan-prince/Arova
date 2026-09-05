'use client';

export interface AuditEvent {
  id: string;
  event_type: string;
  ai_involved: boolean;
  ai_model?: string;
  latency_ms: number;
  decision_reasoning?: string;
  created_at: string;
}

interface ActivityFeedProps {
  realEvents?: AuditEvent[];
}

const SIMULATED_EVENTS = [
  { id: 's1', time: '11:42 AM', description: 'AI shopper discovered SportKart', ai: true },
  { id: 's2', time: '11:42 AM', description: '3 relevant products matched', ai: true },
  { id: 's3', time: '11:43 AM', description: 'Buyer requested ₹4,000', ai: false },
  { id: 's4', time: '11:43 AM', description: 'Minimum price protection applied', ai: false },
  { id: 's5', time: '11:43 AM', description: 'Offer generated: ₹4,299', ai: false },
  { id: 's6', time: '11:44 AM', description: 'Razorpay checkout completed', ai: false },
];

const EVENT_DESCRIPTIONS: Record<string, string> = {
  DISCOVERY: 'AI shopper discovered your store',
  QUERY: 'Products searched',
  NEGOTIATION_STEP: 'Price negotiation',
  CHECKOUT: 'Order created',
  PAYMENT_SUCCESS: 'Payment completed',
  CATALOG_GENERATED: 'Product AI description updated',
  RULE_COMPILED: 'Selling rule activated',
};

function mapEventType(eventType: string): string {
  return EVENT_DESCRIPTIONS[eventType] || eventType.replace(/_/g, ' ');
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export function ActivityFeed({ realEvents }: ActivityFeedProps) {
  const hasReal = realEvents && realEvents.length > 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Arova is working for you
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recent activity timeline
          </p>
        </div>
        {!hasReal && <span className="demo-badge">Demo data</span>}
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

        <div className="space-y-4">
          {hasReal
            ? realEvents.map((event, idx) => (
                <TimelineItem
                  key={event.id}
                  time={formatTime(event.created_at)}
                  description={mapEventType(event.event_type)}
                  ai={event.ai_involved}
                  reasoning={event.decision_reasoning}
                  index={idx}
                />
              ))
            : SIMULATED_EVENTS.map((event, idx) => (
                <TimelineItem
                  key={event.id}
                  time={event.time}
                  description={event.description}
                  ai={event.ai}
                  index={idx}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  time,
  description,
  ai,
  reasoning,
  index,
}: {
  time: string;
  description: string;
  ai: boolean;
  reasoning?: string;
  index: number;
}) {
  return (
    <div
      className="interactive-row flex items-start gap-3 animate-timeline-enter stagger-item"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Dot indicator */}
      <div
        className={`w-[15px] h-[15px] rounded-full border-2 shrink-0 mt-0.5 relative z-10 ${
          ai
            ? 'border-ai bg-ai-subtle'
            : 'border-deterministic bg-deterministic-subtle'
        }`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{description}</p>
        {reasoning && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            {reasoning}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-muted">{time}</span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              ai
                ? 'bg-ai-subtle text-ai'
                : 'bg-deterministic-subtle text-deterministic'
            }`}
          >
            {ai ? 'AI' : 'Deterministic'}
          </span>
        </div>
      </div>
    </div>
  );
}
