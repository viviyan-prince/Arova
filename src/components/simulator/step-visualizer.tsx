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

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 flex-1">
      <h2 className="text-[13px] font-semibold text-zinc-300 mb-3">Pipeline</h2>
      <div className="space-y-1.5">
        {STEP_NAMES.map((name, idx) => {
          const stepData = getStepData(name);
          const status = stepData?.status || 'pending';

          return (
            <div
              key={name}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                status === 'running'
                  ? 'bg-indigo-600/10 border border-indigo-500/20'
                  : status === 'complete'
                  ? 'bg-emerald-500/5 border border-emerald-500/10'
                  : status === 'error'
                  ? 'bg-red-500/5 border border-red-500/10'
                  : 'bg-zinc-800/20 border border-transparent'
              }`}
            >
              {/* Status icon */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {status === 'running' ? (
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                ) : status === 'complete' ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : status === 'error' ? (
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[12px] font-semibold ${
                    status === 'complete' ? 'text-zinc-200' :
                    status === 'running' ? 'text-indigo-300' :
                    status === 'error' ? 'text-red-300' :
                    'text-zinc-500'
                  }`}>
                    {name}
                  </span>
                </div>
                {stepData && status !== 'pending' && (
                  <div className="flex items-center gap-2 mt-0.5">
                    {stepData.ai_involved ? (
                      <span className="text-[10px] font-medium text-amber-400">AI</span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-400">Det</span>
                    )}
                    <span className="text-[10px] text-zinc-600 font-mono">{stepData.latency_ms}ms</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
