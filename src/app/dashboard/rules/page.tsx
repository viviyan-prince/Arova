'use client';

import { useEffect, useState, useCallback } from 'react';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useToast } from '@/components/ui/toast';
import { useCursorPosition } from '@/hooks/use-cursor-position';

interface CommerceRule {
  id: string;
  rule_text: string;
  rule_type: string;
  is_compiled: boolean;
  compiled_rule?: Record<string, unknown> | null;
  test_results?: { passed: boolean; details?: string }[] | null;
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  negotiation: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  pricing: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  shipping: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  acceptance: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  return: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

function typeBadge(type: string) {
  const s = TYPE_STYLES[type] ?? { bg: 'bg-zinc-500/10', text: 'text-zinc-400' };
  return `${s.bg} ${s.text}`;
}

export default function RulesPage() {
  const [rules, setRules] = useState<CommerceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [compilingId, setCompilingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('/api/merchant/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(Array.isArray(data) ? data : data.rules ?? data.data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function handleCompile(ruleId: string) {
    setCompilingId(ruleId);
    try {
      const res = await fetch('/api/merchant/rules-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId }),
      });
      if (res.ok) {
        await fetchRules();
        setExpandedId(ruleId);
      }
    } catch {
      // silent
    } finally {
      setCompilingId(null);
    }
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Commerce Rules</h1>
            {!loading && rules.length > 0 && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {rules.length}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Intelligent automation for agent negotiations and pricing.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-[72px]" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden divide-y divide-zinc-800/40">
          {rules.map((rule, idx) => {
            const isExpanded = expandedId === rule.id;
            const isCompiling = compilingId === rule.id;

            return (
              <div
                key={rule.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/20 transition-colors">
                  {/* Type badge */}
                  <span
                    className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${typeBadge(rule.rule_type)}`}
                  >
                    {rule.rule_type}
                  </span>

                  {/* Rule text */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                    className="flex-1 min-w-0 text-left group"
                  >
                    <p className="text-[13px] text-zinc-200 leading-relaxed group-hover:text-white transition-colors truncate">
                      {rule.rule_text}
                    </p>
                  </button>

                  {/* Status */}
                  <span
                    className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      rule.is_compiled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-zinc-500/10 text-zinc-500'
                    }`}
                  >
                    {rule.is_compiled ? 'Compiled' : 'Pending'}
                  </span>

                  {/* Compile action */}
                  <button
                    type="button"
                    onClick={() => handleCompile(rule.id)}
                    disabled={isCompiling}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCompiling ? (
                      <>
                        <Spinner />
                        Compiling
                      </>
                    ) : (
                      <>
                        <CompileIcon />
                        Compile
                      </>
                    )}
                  </button>

                  {/* Expand chevron */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                    className="shrink-0 p-1 rounded text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-800/30 bg-zinc-950/40 animate-fade-in">
                    {rule.is_compiled ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
                        {/* Compiled JSON */}
                        <div>
                          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Compiled Rule
                          </p>
                          {rule.compiled_rule ? (
                            <pre className="text-[12px] leading-relaxed text-zinc-400 font-mono bg-zinc-900 border border-zinc-800/40 rounded-lg p-4 overflow-x-auto max-h-60">
                              {JSON.stringify(rule.compiled_rule, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-[12px] text-zinc-600">No compiled output available.</p>
                          )}
                        </div>

                        {/* Test results */}
                        <div>
                          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Test Results
                          </p>
                          {rule.test_results && rule.test_results.length > 0 ? (
                            <div className="space-y-1.5">
                              {rule.test_results.map((test, tidx) => (
                                <div
                                  key={tidx}
                                  className={`flex items-start gap-2.5 p-3 rounded-lg text-[12px] ${
                                    test.passed
                                      ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10'
                                      : 'bg-red-500/5 text-red-400 border border-red-500/10'
                                  }`}
                                >
                                  <span className="shrink-0 mt-px">
                                    {test.passed ? (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </span>
                                  <span>{test.details || (test.passed ? 'Passed' : 'Failed')}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[12px] text-zinc-600">No test results available.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px] text-zinc-500 mt-3">
                        Compile this rule to generate a deterministic JSON representation and run validation tests.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Small components ---------- */

function EmptyState() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-zinc-200 mb-2">Automate your commerce workflows</h3>
      <p className="text-[13px] text-zinc-500 max-w-md mx-auto mb-6">
        Create rules to handle agent negotiations, dynamic pricing, acceptance criteria, and shipping policies. Write them in plain English and let AI compile them to deterministic logic.
      </p>
      <a
        href="/api/merchant/rules"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-colors"
      >
        View Rules API
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CompileIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
}
