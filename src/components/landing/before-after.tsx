'use client';

import { useTranslation } from '@/lib/i18n/context';

export function BeforeAfter() {
  const t = useTranslation();

  return (
    <section className="px-6 py-24 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-14 tracking-tight">
          {t('landing.comparison.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="premium-card bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-error" />
              <span className="text-[13px] font-semibold text-error">{t('landing.comparison.before')}</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Customer', arrow: true },
                { label: 'Google / Instagram', arrow: true },
                { label: 'Marketplace', arrow: true },
                { label: 'Maybe your store', arrow: false, dim: true },
              ].map((step, i) => (
                <div key={i}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${step.dim ? 'bg-error-subtle' : 'bg-surface-raised'}`}>
                    <span className={`text-[13px] ${step.dim ? 'text-error line-through' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                  {step.arrow && (
                    <div className="flex justify-center py-1">
                      <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="premium-card bg-surface border border-accent/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-revenue" />
              <span className="text-[13px] font-semibold text-revenue">{t('landing.comparison.after')}</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'AI shopper', arrow: true },
                { label: 'Discovers your products', arrow: true },
                { label: 'Negotiates within your rules', arrow: true },
                { label: 'Buys via Razorpay', arrow: true },
                { label: 'Payment collected', arrow: false, highlight: true },
              ].map((step, i) => (
                <div key={i}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${step.highlight ? 'bg-revenue-subtle' : 'bg-surface-raised'}`}>
                    {step.highlight && (
                      <svg className="w-4 h-4 text-revenue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    <span className={`text-[13px] ${step.highlight ? 'text-revenue font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                  {step.arrow && (
                    <div className="flex justify-center py-1">
                      <svg className="w-4 h-4 text-revenue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
