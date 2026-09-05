'use client';

import { useEffect, useState, useCallback } from 'react';

interface CommerceRule {
  id: string;
  rule_text: string;
  rule_type: string;
  is_compiled: boolean;
  compiled_rule?: Record<string, unknown> | null;
  test_results?: { passed: boolean; details?: string }[] | null;
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
        setRules(Array.isArray(data) ? data : data.data ?? []);
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Commerce Rules</h2>
        <span className="text-sm text-gray-400">
          {rules.length} rule{rules.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No rules defined</p>
          <p className="text-sm mt-1">
            Create commerce rules via the API to start configuring agent
            negotiations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const isExpanded = expandedId === rule.id;

            return (
              <div
                key={rule.id}
                className="bg-gray-900 rounded-lg border border-gray-800"
              >
                {/* Rule header */}
                <div className="flex items-start justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      className="text-left w-full"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : rule.id)
                      }
                    >
                      <p className="text-sm text-white leading-relaxed">
                        {rule.rule_text}
                      </p>
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400">
                        {rule.rule_type}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          rule.is_compiled
                            ? 'bg-emerald-900/40 text-emerald-400'
                            : 'bg-amber-900/40 text-amber-400'
                        }`}
                      >
                        {rule.is_compiled ? 'Compiled' : 'Not compiled'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompile(rule.id)}
                    disabled={compilingId === rule.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {compilingId === rule.id ? (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-3 h-3 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Compiling...
                      </span>
                    ) : (
                      'Compile Rule'
                    )}
                  </button>
                </div>

                {/* Expanded: compiled rule + test results */}
                {isExpanded && rule.is_compiled && (
                  <div className="border-t border-gray-800 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Compiled JSON */}
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                          Compiled Rule
                        </p>
                        {rule.compiled_rule ? (
                          <pre className="text-xs text-gray-400 bg-gray-950 rounded p-3 overflow-x-auto max-h-64">
                            {JSON.stringify(rule.compiled_rule, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-xs text-gray-500">
                            No compiled output available.
                          </p>
                        )}
                      </div>

                      {/* Test results */}
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                          Test Results
                        </p>
                        {rule.test_results && rule.test_results.length > 0 ? (
                          <div className="space-y-2">
                            {rule.test_results.map((test, idx) => (
                              <div
                                key={idx}
                                className={`flex items-start gap-2 p-2 rounded text-xs ${
                                  test.passed
                                    ? 'bg-emerald-950/30 text-emerald-400'
                                    : 'bg-red-950/30 text-red-400'
                                }`}
                              >
                                <span className="shrink-0 mt-0.5">
                                  {test.passed ? (
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  )}
                                </span>
                                <span>
                                  {test.details || (test.passed ? 'Passed' : 'Failed')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            No test results available.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isExpanded && !rule.is_compiled && (
                  <div className="border-t border-gray-800 p-4">
                    <p className="text-sm text-gray-500">
                      Compile this rule to see the deterministic JSON
                      representation and test results.
                    </p>
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
