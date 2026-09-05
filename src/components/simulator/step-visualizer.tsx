'use client';

import { BuyerAgentStep } from '@/lib/ai/buyer-agent';

interface Props {
  steps: BuyerAgentStep[];
}

const STEP_NAMES = ['DISCOVER', 'QUERY', 'SELECT', 'NEGOTIATE', 'CHECKOUT', 'PAYMENT'];

export default function StepVisualizer({ steps }: Props) {
  const getStepData = (name: string): BuyerAgentStep | undefined => {
    return steps.find((s) => s.name === name);
  };

  const getStatusColor = (status?: BuyerAgentStep['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-600 bg-blue-600/10';
      case 'complete':
        return 'border-green-600 bg-green-600/10';
      case 'error':
        return 'border-red-600 bg-red-600/10';
      default:
        return 'border-gray-700 bg-gray-900';
    }
  };

  const getStatusIcon = (status?: BuyerAgentStep['status']) => {
    switch (status) {
      case 'running':
        return (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'complete':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-700" />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Pipeline Steps</h2>
      <div className="space-y-3">
        {STEP_NAMES.map((name, idx) => {
          const stepData = getStepData(name);
          const status = stepData?.status || 'pending';

          return (
            <div
              key={name}
              className={`rounded-lg border p-3 transition-all ${getStatusColor(status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      {idx + 1}.
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {name}
                    </span>
                  </div>
                  {stepData && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        {stepData.ai_involved ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-yellow-600/20 text-yellow-400 font-medium">
                            AI: {stepData.ai_model}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-600/20 text-green-400 font-medium">
                            Deterministic
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {stepData.latency_ms}ms
                        </span>
                      </div>
                      {stepData.reasoning && (
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {stepData.reasoning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
