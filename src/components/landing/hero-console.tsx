'use client';

import { useEffect, useState } from 'react';

interface Step {
  id: number;
  name: string;
  status: 'waiting' | 'active' | 'complete';
  type: 'ai' | 'deterministic';
  data?: string;
}

export function HeroConsole() {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, name: 'Discover', status: 'waiting', type: 'ai', data: 'SportKart India' },
    { id: 2, name: 'Query', status: 'waiting', type: 'ai', data: 'Running shoes' },
    { id: 3, name: 'Select', status: 'waiting', type: 'ai', data: 'ProStride Marathon' },
    { id: 4, name: 'Negotiate', status: 'waiting', type: 'deterministic', data: '₹4,499' },
    { id: 5, name: 'Checkout', status: 'waiting', type: 'deterministic', data: 'RZP Order' },
    { id: 6, name: 'Payment', status: 'waiting', type: 'deterministic', data: 'Complete' },
  ]);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length) {
          // Reset after completion
          setTimeout(() => {
            setSteps(steps.map(s => ({ ...s, status: 'waiting' })));
            return 0;
          }, 2000);
          return prev;
        }

        // Update step status
        setSteps(prevSteps => prevSteps.map((step, idx) => {
          if (idx < prev) return { ...step, status: 'complete' };
          if (idx === prev) return { ...step, status: 'active' };
          return { ...step, status: 'waiting' };
        }));

        return prev + 1;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12">
      {/* Console Container */}
      <div className="relative bg-gradient-to-b from-zinc-900/90 to-black/90 rounded-2xl border border-zinc-800/50 p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs font-mono text-zinc-500">agent_commerce_protocol.exec</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-500">Live</span>
          </div>
        </div>

        {/* Protocol Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-500 ${
                step.status === 'active'
                  ? 'bg-zinc-800/60 border border-zinc-700/50 shadow-lg'
                  : step.status === 'complete'
                  ? 'bg-zinc-900/40 border border-transparent'
                  : 'bg-transparent border border-transparent opacity-40'
              }`}
            >
              {/* Step Number & Status */}
              <div className="flex items-center gap-3 min-w-[100px]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                  step.status === 'complete'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : step.status === 'active'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                    : 'bg-zinc-800 text-zinc-600 border border-zinc-700'
                }`}>
                  {step.status === 'complete' ? '✓' : step.id}
                </div>
                <span className={`text-sm font-medium ${
                  step.status === 'active' ? 'text-white' : step.status === 'complete' ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {step.name}
                </span>
              </div>

              {/* Type Badge */}
              <div className="flex-1">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  step.type === 'ai'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {step.type === 'ai' ? (
                    <>
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                      </svg>
                      AI
                    </>
                  ) : (
                    <>
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Deterministic
                    </>
                  )}
                </span>
              </div>

              {/* Data Output */}
              {step.status !== 'waiting' && (
                <div className="min-w-[140px] text-right">
                  <span className="text-xs font-mono text-zinc-500">{step.data}</span>
                </div>
              )}

              {/* Loading Indicator */}
              {step.status === 'active' && (
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">Latency</span>
            <span className="font-mono text-emerald-400">~127ms</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">Protocol</span>
            <span className="font-mono text-zinc-400">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">Audit</span>
            <span className="font-mono text-indigo-400">Logged</span>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-50" />
    </div>
  );
}
