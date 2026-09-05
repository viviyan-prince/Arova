'use client';

interface Props {
  sessionId: string;
  trustScore: number;
  status: 'ready' | 'active' | 'completed' | 'blocked';
}

export default function AgentIdentityCard({ sessionId, trustScore, status }: Props) {
  const statusConfig = {
    active: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Active' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Completed' },
    blocked: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Blocked' },
    ready: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', label: 'Ready' },
  };

  const s = statusConfig[status];

  const trustColor = trustScore >= 70 ? 'bg-emerald-500' : trustScore >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const trustTextColor = trustScore >= 70 ? 'text-emerald-400' : trustScore >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-200">AI Buyer Agent</h3>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
            {sessionId.slice(0, 20)}...
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text} border ${s.border}`}>
          {s.label}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-zinc-500">Trust Score</span>
          <span className={`text-[13px] font-semibold font-mono ${trustTextColor}`}>
            {trustScore}
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${trustColor}`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
