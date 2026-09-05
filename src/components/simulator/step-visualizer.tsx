'use client';

import { BuyerAgentStep } from '@/lib/ai/buyer-agent';

interface Props {
  steps: BuyerAgentStep[];
}

const STEP_NAMES = ['DISCOVER', 'QUERY', 'SELECT', 'NEGOTIATE', 'CHECKOUT', 'PAYMENT'];

const STEP_DESCRIPTIONS: Record<string, string> = {
  DISCOVER: 'Store found',
  QUERY: 'Products searched',
  SELECT: 'Best match found',
  NEGOTIATE: 'Price negotiated',
  CHECKOUT: 'Order created',
  PAYMENT: 'Payment ready',
};

export default function StepVisualizer({ steps }: Props) {
  const getStepData = (name: string): BuyerAgentStep | undefined => {
    return steps.find((s) => s.name === name);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex-1">
      <h2 className="text-[13px] font-semibold text-foreground/80 mb-3">Pipeline</h2>
      <div>
        {STEP_NAMES.map((name, idx) => {
          const stepData = getStepData(name);
          const status = stepData?.status || 'pending';

          return (
            <div key={name}>
              {/* Connector line */}
              {idx > 0 && (
                <div className="flex justify-center">
                  <div className="w-px h-2 bg-border-subtle" />
                </div>
              )}

              {/* Step card */}
              <div
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  status === 'running'
                    ? 'bg-accent/10 border border-accent/20'
                    : status === 'complete'
                    ? 'bg-revenue-subtle/50 border border-revenue/10'
                    : status === 'error'
                    ? 'bg-error-subtle/50 border border-error/10'
                    : 'bg-surface-raised/40 border border-transparent'
                }`}
              >
                {/* Status icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {status === 'running' ? (
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : status === 'complete' ? (
                    <svg className="w-4 h-4 text-revenue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : status === 'error' ? (
                    <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-semibold ${
                      status === 'complete' ? 'text-foreground' :
                      status === 'running' ? 'text-accent' :
                      status === 'error' ? 'text-error' :
                      'text-muted-foreground'
                    }`}>
                      {name}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${
                    status === 'complete' ? 'text-muted-foreground' :
                    status === 'running' ? 'text-accent/70' :
                    'text-muted'
                  }`}>
                    {STEP_DESCRIPTIONS[name]}
                  </p>
                  {stepData && status !== 'pending' && (
                    <div className="flex items-center gap-2 mt-1">
                      {stepData.ai_involved ? (
                        <span className="text-[10px] font-medium text-ai">AI</span>
                      ) : (
                        <span className="text-[10px] font-medium text-deterministic">Det</span>
                      )}
                      <span className="text-[10px] text-muted font-mono">{stepData.latency_ms}ms</span>
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
