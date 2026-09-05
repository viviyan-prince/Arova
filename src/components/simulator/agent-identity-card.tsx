'use client';

interface Props {
  sessionId: string;
  trustScore: number;
  status: 'ready' | 'active' | 'completed' | 'blocked';
}

export default function AgentIdentityCard({ sessionId, trustScore, status }: Props) {
  const statusConfig = {
    active: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20', label: 'Active' },
    completed: { bg: 'bg-revenue-subtle', text: 'text-revenue', border: 'border-revenue/20', label: 'Completed' },
    blocked: { bg: 'bg-error-subtle', text: 'text-error', border: 'border-error/20', label: 'Blocked' },
    ready: { bg: 'bg-surface-raised', text: 'text-muted-foreground', border: 'border-border', label: 'Ready' },
  };

  const s = statusConfig[status];

  const trustColor = trustScore >= 70 ? 'bg-revenue' : trustScore >= 40 ? 'bg-warning' : 'bg-error';
  const trustTextColor = trustScore >= 70 ? 'text-revenue' : trustScore >= 40 ? 'text-warning' : 'text-error';

  const trustExplanation =
    trustScore >= 70
      ? 'Merchant rules respected, inventory verified, all steps auditable'
      : trustScore >= 40
      ? 'Some verification pending'
      : 'Limited trust — restricted actions';

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">AI Shopper</h3>
          <p className="text-[11px] text-muted font-mono mt-0.5">
            {sessionId.slice(0, 20)}...
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text} border ${s.border}`}>
          {s.label}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground">Trust Score</span>
          <span className={`text-[13px] font-semibold font-mono ${trustTextColor}`}>
            {trustScore}
          </span>
        </div>
        <div className="w-full bg-surface-raised rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${trustColor}`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
        <p className="text-[10px] text-muted mt-2 leading-relaxed">
          {trustExplanation}
        </p>
      </div>
    </div>
  );
}
