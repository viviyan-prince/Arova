'use client';

import { useTranslation } from '@/lib/i18n/context';

export function AIDeterministicSplit() {
  const t = useTranslation();

  const aiTasks = [
    'Understand buyer intent',
    'Discover relevant products',
    'Match queries semantically',
    'Interpret natural language',
  ];

  const deterministicTasks = [
    'Check price rules',
    'Validate inventory',
    'Create Razorpay order',
    'Process payment',
    'Enforce spending limits',
  ];

  return (
    <section className="px-6 py-24 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
            {t('landing.aiDet.title')}
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-xl mx-auto">
            {t('landing.aiDet.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* AI side */}
          <div className="ai-indicator premium-card bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-ai-subtle flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-ai" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">AI understands</p>
                <p className="text-[12px] text-ai font-mono">20% of protocol</p>
              </div>
            </div>

            <div className="space-y-2">
              {aiTasks.map((task) => (
                <div key={task} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-raised">
                  <div className="w-1.5 h-1.5 rounded-full bg-ai shrink-0" />
                  <span className="text-[13px] text-muted-foreground">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deterministic side */}
          <div className="premium-card bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-deterministic-subtle flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-deterministic" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Rules control</p>
                <p className="text-[12px] text-deterministic font-mono">80% of protocol</p>
              </div>
            </div>

            <div className="space-y-2">
              {deterministicTasks.map((task) => (
                <div key={task} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-raised">
                  <div className="w-1.5 h-1.5 rounded-full bg-deterministic shrink-0" />
                  <span className="text-[13px] text-muted-foreground">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-[13px] font-medium text-deterministic">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('landing.aiDet.zeroAi')}
          </span>
        </div>
      </div>
    </section>
  );
}
