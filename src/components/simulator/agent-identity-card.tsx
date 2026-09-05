'use client';

interface Props {
  sessionId: string;
  trustScore: number;
  status: 'ready' | 'active' | 'completed' | 'blocked';
}

export default function AgentIdentityCard({ sessionId, trustScore, status }: Props) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/50';
      case 'completed':
        return 'bg-green-600/20 text-green-400 border-green-600/50';
      case 'blocked':
        return 'bg-red-600/20 text-red-400 border-red-600/50';
      default:
        return 'bg-gray-700/20 text-gray-400 border-gray-700/50';
    }
  };

  const getTrustScoreColor = () => {
    if (trustScore >= 70) return 'text-green-400';
    if (trustScore >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">AI Buyer Agent</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {sessionId.slice(0, 20)}...
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor()}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">Trust Score</span>
            <span className={`text-sm font-bold ${getTrustScoreColor()}`}>
              {trustScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                trustScore >= 70
                  ? 'bg-green-500'
                  : trustScore >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Identity verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
