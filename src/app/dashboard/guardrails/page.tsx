'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/context';

const PROTECTIONS = [
  {
    title: 'Money',
    description: 'AI cannot directly move money.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Pricing',
    description: 'AI cannot cross your minimum price.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    title: 'Inventory',
    description: 'Out-of-stock products cannot be sold.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: 'Payments',
    description: 'All payments are processed through Razorpay.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    title: 'Audit',
    description: 'Every action is logged and auditable.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

const AI_HANDLES = [
  'Understand intent',
  'Discover products',
  'Match queries',
  'Interpret language',
];

const DETERMINISTIC_HANDLES = [
  'Check price rules',
  'Validate inventory',
  'Create orders',
  'Process payments',
  'Enforce limits',
];

export default function GuardrailsPage() {
  const [showModal, setShowModal] = useState(false);
  const [paused, setPaused] = useState(false);
  const t = useTranslation();

  function handlePause() {
    setShowModal(true);
  }

  function confirmPause() {
    setPaused(true);
    setShowModal(false);
  }

  function handleResume() {
    setPaused(false);
  }

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {t('guardrails.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('guardrails.subtitle')}
        </p>
      </div>

      {/* Protection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {PROTECTIONS.map((p, idx) => (
          <div
            key={p.title}
            className="premium-card bg-surface border border-border rounded-xl p-5 card-hover stagger-item animate-scale-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-success-subtle flex items-center justify-center text-success shrink-0">
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t('common.protected')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI vs Deterministic */}
      <div className="premium-card bg-surface border border-border rounded-xl p-6 mb-10 animate-fade-in">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            AI vs Deterministic
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI understands. Rules control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI column */}
          <div className="ai-indicator">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-ai intelligence-pulse" />
              <h3 className="text-sm font-medium text-ai">AI handles</h3>
            </div>
            <div className="space-y-2">
              {AI_HANDLES.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-ai-subtle rounded-lg px-3 py-2"
                >
                  <svg className="w-3.5 h-3.5 text-ai shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deterministic column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-deterministic" />
              <h3 className="text-sm font-medium text-deterministic">
                Deterministic
              </h3>
            </div>
            <div className="space-y-2">
              {DETERMINISTIC_HANDLES.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-deterministic-subtle rounded-lg px-3 py-2"
                >
                  <svg className="w-3.5 h-3.5 text-deterministic shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <span className="text-xs font-medium text-deterministic bg-deterministic-subtle px-3 py-1 rounded-full">
            Zero AI in the money path
          </span>
        </div>
      </div>

      {/* Emergency Stop */}
      <div
        className={`border-2 rounded-xl p-6 transition-colors ${
          paused
            ? 'bg-error-subtle border-error/40'
            : 'bg-surface border-error/30'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-error-subtle flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Emergency stop
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {paused
                ? 'AI sales are currently paused. AI shoppers cannot complete transactions.'
                : 'Immediately pause all autonomous AI selling on your store.'}
            </p>

            {paused ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-error text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  AI sales paused
                </div>
                <button
                  type="button"
                  onClick={handleResume}
                  className="inline-flex items-center gap-2 bg-success hover:bg-success/90 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors focus-ring"
                >
                  Resume AI sales
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex items-center gap-2 bg-error hover:bg-error/90 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors focus-ring"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
                {t('guardrails.emergencyStop')}
              </button>
            )}

            <p className="text-[11px] text-muted mt-3">
              This is a demo of the emergency stop feature.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-surface-raised border border-border rounded-xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <h3 className="text-base font-semibold text-foreground mb-2">
              Pause all autonomous selling?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will stop AI shoppers from completing transactions. Your
              product listings will remain visible, but no new orders can be
              placed through AI.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg border border-border focus-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPause}
                className="bg-error hover:bg-error/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors focus-ring"
              >
                Pause AI sales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
