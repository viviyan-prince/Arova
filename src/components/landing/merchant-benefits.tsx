'use client';

import { useTranslation } from '@/lib/i18n/context';

const benefits = [
  {
    titleKey: 'landing.benefit.discover.title',
    descKey: 'landing.benefit.discover.desc',
    icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  },
  {
    titleKey: 'landing.benefit.rules.title',
    descKey: 'landing.benefit.rules.desc',
    icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
  },
  {
    titleKey: 'landing.benefit.paid.title',
    descKey: 'landing.benefit.paid.desc',
    icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },
  {
    titleKey: 'landing.benefit.control.title',
    descKey: 'landing.benefit.control.desc',
    icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  },
];

export function MerchantBenefits() {
  const t = useTranslation();

  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4 tracking-tight">
          {t('landing.benefits.title')}
        </h2>
        <p className="text-[15px] text-muted-foreground text-center max-w-xl mx-auto mb-14">
          {t('landing.aiDet.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={b.titleKey}
              className="premium-card cursor-spotlight bg-surface border border-border rounded-xl p-6 stagger-item"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">{t(b.titleKey)}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{t(b.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
