import Link from 'next/link';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { HeroConsole } from '@/components/landing/hero-console';
import { AIDeterministicSplit } from '@/components/landing/ai-deterministic-split';
import { CinematicParticleField } from '@/components/hero/cinematic-particle-field';
import { CursorTrail } from '@/components/hero/cursor-trail';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Cursor Trail */}
      <CursorTrail />
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Arova</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="text-[13px] text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Demo
            </Link>
            <Link
              href="/dashboard"
              className="text-[13px] font-medium bg-white text-zinc-900 hover:bg-zinc-200 px-4 py-1.5 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center relative overflow-hidden min-h-screen">
        {/* Cinematic Particle Field */}
        <div className="absolute inset-0">
          <CinematicParticleField />
        </div>

        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none" />

        {/* Subtle navy atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[11px] text-zinc-400 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Razorpay AI Buildathon — Track 01
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in">
            The missing on-ramp
            <br />
            for <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-shimmer">agentic commerce</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-4">
            Make your Razorpay store discoverable and transactable by AI buyer agents.
          </p>

          <p className="text-sm text-zinc-500 max-w-xl mx-auto mb-12">
            <span className="text-emerald-400 font-medium">80% deterministic logic</span>
            {' · '}
            <span className="text-amber-400 font-medium">20% AI intelligence</span>
            {' · '}
            <span className="text-zinc-400">Zero AI in the money path</span>
          </p>

          {/* Hero Console */}
          <HeroConsole />

          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/demo">
              <MagneticButton variant="primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                Try Live Demo
              </MagneticButton>
            </Link>
            <Link href="/dashboard">
              <MagneticButton variant="secondary">
                Open Dashboard
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider text-center mb-3">How it works</p>
          <h2 className="text-xl font-semibold text-center text-white mb-10">Agent protocol in 6 steps</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
            {[
              { step: '01', name: 'Discover', desc: 'Agent finds your store', type: 'det' },
              { step: '02', name: 'Query', desc: 'Search your catalog', type: 'ai' },
              { step: '03', name: 'Select', desc: 'AI picks best match', type: 'ai' },
              { step: '04', name: 'Negotiate', desc: 'Rule-based pricing', type: 'det' },
              { step: '05', name: 'Checkout', desc: 'Razorpay order', type: 'det' },
              { step: '06', name: 'Payment', desc: 'Secure payment link', type: 'det' },
            ].map((s, idx) => (
              <div
                key={s.step}
                className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 text-center card-hover border-transition hover:border-zinc-700/60 stagger-item"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="text-[11px] font-mono text-zinc-600">{s.step}</span>
                <p className="text-[13px] font-semibold text-white mt-1">{s.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{s.desc}</p>
                <span className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  s.type === 'ai' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {s.type === 'ai' ? 'AI' : 'Deterministic'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI vs Deterministic */}
      <AIDeterministicSplit />

      {/* Features */}
      <section className="px-6 pb-20 border-t border-zinc-800/50 pt-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {[
              {
                title: 'Agent-Readable Catalog',
                desc: 'AI-generated semantic descriptions and Schema.org JSON-LD make your products discoverable by any buyer agent.',
                icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
              },
              {
                title: 'Deterministic Negotiation',
                desc: 'Write pricing rules in plain English. Gemini compiles them to structured logic. No AI in the money path — ever.',
                icon: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z',
              },
              {
                title: 'Full Audit Trail',
                desc: 'Every action logged with AI-involvement flags, model identifiers, decision reasoning, and millisecond latency.',
                icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
              },
            ].map((f, idx) => (
              <div key={f.title} className="p-5 stagger-item" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-9 h-9 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-3">
                  <svg className="w-[18px] h-[18px] text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-zinc-800/50">
        <p className="text-[12px] text-zinc-600 text-center">
          Built for Razorpay AI Buildathon &mdash; Agentic Commerce On-Ramp
        </p>
      </footer>
    </div>
  );
}
