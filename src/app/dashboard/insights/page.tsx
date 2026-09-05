'use client';

import { useTranslation } from '@/lib/i18n/context';

const TRENDING_SEARCHES = [
  { query: 'Running shoes under ₹5,000', intent: 'High', match: 82 },
  { query: 'Best gym gloves for beginners', intent: 'High', match: 65 },
  { query: 'Eco-friendly yoga mat', intent: 'Medium', match: 71 },
  { query: 'Water bottle for cycling', intent: 'Medium', match: 88 },
  { query: 'Compression socks for running', intent: 'Low', match: 34 },
  { query: 'Affordable dumbbells set', intent: 'High', match: 45 },
];

const BUYER_QUESTIONS = [
  'Can you give me a discount?',
  'Is this product available in other sizes?',
  'Do you have waterproof options?',
  'What\'s the return policy?',
];

const UNFULFILLED = [
  { product: 'Trail running shoes', searches: 23 },
  { product: 'Resistance bands set', searches: 18 },
  { product: 'Sports sunglasses', searches: 14 },
];

function intentColor(intent: string) {
  switch (intent) {
    case 'High':
      return 'bg-success-subtle text-success';
    case 'Medium':
      return 'bg-warning-subtle text-warning';
    case 'Low':
      return 'bg-error-subtle text-error';
    default:
      return 'bg-surface-raised text-muted-foreground';
  }
}

function matchBarColor(match: number) {
  if (match >= 70) return 'bg-success';
  if (match >= 50) return 'bg-warning';
  return 'bg-error';
}

export default function InsightsPage() {
  const t = useTranslation();
  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {t('insights.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('insights.subtitle')}
        </p>
      </div>

      {/* Demo label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="demo-badge">{t('common.demo')}</span>
        <span className="text-xs text-muted-foreground">
          Simulated insights &mdash; connect your store for real data
        </span>
      </div>

      {/* Trending searches */}
      <section className="premium-card ai-indicator bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Trending searches
        </h2>
        <div className="space-y-3">
          {TRENDING_SEARCHES.map((item, idx) => (
            <div
              key={item.query}
              className="flex items-center gap-4 stagger-item"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span className="text-xs text-muted font-mono w-5 shrink-0">
                {idx + 1}.
              </span>
              <p className="text-sm text-foreground flex-1 min-w-0 truncate">
                &ldquo;{item.query}&rdquo;
              </p>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${intentColor(
                  item.intent
                )}`}
              >
                {item.intent} intent
              </span>
              <div className="flex items-center gap-2 shrink-0 w-28">
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${matchBarColor(item.match)}`}
                    style={{ width: `${item.match}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono w-8 text-right">
                  {item.match}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Price sensitivity */}
      <section className="premium-card bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Price sensitivity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="chart-enter bg-surface-raised rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Avg requested discount
            </p>
            <p className="text-xl font-semibold text-warning font-mono">14%</p>
          </div>
          <div className="bg-surface-raised rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Most common price range
            </p>
            <p className="text-xl font-semibold text-foreground font-mono">
              {'₹'}1,000&ndash;{'₹'}5,000
            </p>
          </div>
          <div className="bg-surface-raised rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Price-sensitive categories
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-warning-subtle text-warning px-2 py-0.5 rounded-full">
                Footwear
              </span>
              <span className="text-xs bg-warning-subtle text-warning px-2 py-0.5 rounded-full">
                Accessories
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Common buyer questions */}
        <section className="premium-card ai-indicator bg-surface border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Common buyer questions
          </h2>
          <div className="space-y-3">
            {BUYER_QUESTIONS.map((q, idx) => (
              <div
                key={q}
                className="bg-surface-raised rounded-lg px-4 py-3 stagger-item"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <p className="text-sm text-foreground leading-relaxed">
                  &ldquo;{q}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Unfulfilled demand */}
        <section className="premium-card ai-indicator bg-surface border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            Unfulfilled demand
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Products AI shoppers wanted but couldn&rsquo;t find
          </p>
          <div className="space-y-3">
            {UNFULFILLED.map((item, idx) => (
              <div
                key={item.product}
                className="flex items-center justify-between bg-surface-raised rounded-lg px-4 py-3 stagger-item"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-error-subtle flex items-center justify-center">
                    <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground">{item.product}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.searches} searches
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
