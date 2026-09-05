'use client';

import { useEffect, useState } from 'react';

interface Step {
  label: string;
  detail: string;
  status: 'waiting' | 'active' | 'complete';
  type: 'ai' | 'deterministic';
}

const INITIAL_STEPS: Step[] = [
  { label: 'Discovering store', detail: 'SportKart India', status: 'waiting', type: 'deterministic' },
  { label: 'Searching products', detail: 'Running shoes under ₹5,000', status: 'waiting', type: 'ai' },
  { label: 'Best match found', detail: 'ASICS Gel-Contend 9', status: 'waiting', type: 'ai' },
  { label: 'Negotiating price', detail: '₹5,499 → ₹4,299', status: 'waiting', type: 'deterministic' },
  { label: 'Razorpay checkout', detail: 'Order RZP_ai_00142', status: 'waiting', type: 'deterministic' },
  { label: 'Payment complete', detail: '₹4,299 collected', status: 'waiting', type: 'deterministic' },
];

export function ShoppingEventHero() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function advance(idx: number) {
      if (idx >= INITIAL_STEPS.length) {
        setShowResult(true);
        timeout = setTimeout(() => {
          setSteps(INITIAL_STEPS);
          setCurrentIdx(-1);
          setShowResult(false);
          timeout = setTimeout(() => advance(0), 1200);
        }, 3000);
        return;
      }

      setCurrentIdx(idx);
      setSteps(prev =>
        prev.map((s, i) => ({
          ...s,
          status: i < idx ? 'complete' : i === idx ? 'active' : 'waiting',
        }))
      );

      timeout = setTimeout(() => {
        setSteps(prev =>
          prev.map((s, i) => (i === idx ? { ...s, status: 'complete' } : s))
        );
        setTimeout(() => advance(idx + 1), 200);
      }, 1200);
    }

    timeout = setTimeout(() => advance(0), 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="premium-card cursor-spotlight bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success live-pulse" />
              <span className="text-[12px] font-medium text-success">AI shopper detected</span>
            </div>
          </div>
          <span className="text-[11px] text-muted font-mono">live</span>
        </div>

        {/* Query */}
        <div className="px-6 py-3 border-b border-border-subtle bg-surface-raised/50">
          <p className="text-[13px] text-muted-foreground italic">
            &ldquo;Looking for running shoes under ₹5,000&rdquo;
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 space-y-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                step.status === 'active'
                  ? 'bg-accent-subtle'
                  : step.status === 'complete'
                  ? 'bg-transparent'
                  : 'opacity-30'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {step.status === 'active' ? (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : step.status === 'complete' ? (
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                )}
              </div>

              <span className={`text-[13px] font-medium flex-1 ${
                step.status === 'active' ? 'text-foreground' :
                step.status === 'complete' ? 'text-muted-foreground' : 'text-muted'
              }`}>
                {step.label}
              </span>

              {step.status !== 'waiting' && (
                <span className="text-[12px] text-muted-foreground font-mono">
                  {step.detail}
                </span>
              )}

              {step.status !== 'waiting' && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  step.type === 'ai' ? 'bg-ai-subtle text-ai' : 'bg-deterministic-subtle text-deterministic'
                }`}>
                  {step.type === 'ai' ? 'AI' : 'Rules'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Result */}
        {showResult && (
          <div className="px-6 py-4 border-t border-border bg-revenue-subtle animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-revenue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[14px] font-semibold text-revenue">Sale completed</span>
              </div>
              <span className="text-[18px] font-bold font-mono text-revenue">₹4,299</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
