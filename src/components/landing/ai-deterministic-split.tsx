'use client';

export function AIDeterministicSplit() {
  const aiSteps = [
    { name: 'Discovery', desc: 'Natural language store search' },
    { name: 'Query', desc: 'Semantic product understanding' },
    { name: 'Selection', desc: 'Intent-based product matching' },
  ];

  const deterministicSteps = [
    { name: 'Negotiation', desc: 'Rule-based pricing logic' },
    { name: 'Checkout', desc: 'Razorpay order creation' },
    { name: 'Payment', desc: 'Secure payment processing' },
    { name: 'Audit', desc: 'Immutable event logging' },
  ];

  return (
    <section className="px-6 py-32 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Intelligence where it matters.
            <br />
            <span className="text-zinc-500">Determinism where it counts.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            AI understands intent. Rules handle money. Every decision is auditable.
          </p>
        </div>

        {/* Split Visualization */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* AI Side - 2 columns */}
          <div className="md:col-span-2 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl border border-amber-500/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Intelligence</h3>
                <p className="text-xs text-amber-400/80 font-mono">20% of protocol</p>
              </div>
            </div>

            <div className="space-y-3">
              {aiSteps.map((step, idx) => (
                <div key={step.name} className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-400 font-mono shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-amber-500/20">
              <p className="text-xs text-zinc-500">Model: Groq Llama 3.3 70B</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />
            </div>
          </div>

          {/* Deterministic Side - 2 columns */}
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl border border-emerald-500/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Deterministic Logic</h3>
                <p className="text-xs text-emerald-400/80 font-mono">80% of protocol</p>
              </div>
            </div>

            <div className="space-y-3">
              {deterministicSteps.map((step, idx) => (
                <div key={step.name} className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-mono shrink-0">
                    {idx + 4}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20">
              <p className="text-xs text-zinc-500">Engine: Pure arithmetic + rules</p>
            </div>
          </div>
        </div>

        {/* Key Principle */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-zinc-300">Zero AI in the money path</span>
          </div>
        </div>
      </div>
    </section>
  );
}
