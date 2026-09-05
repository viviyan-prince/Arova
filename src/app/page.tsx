import Link from 'next/link';

const features = [
  {
    title: 'Agent-Readable Catalog',
    description:
      'AI-generated semantic descriptions and JSON-LD markup make your products discoverable by any buyer agent.',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    title: 'Smart Negotiation Rules',
    description:
      'Write pricing and discount rules in plain English. We compile them into deterministic logic — no AI in the money path.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Complete Audit Trail',
    description:
      'Every action logged with AI-involvement flags, model identifiers, decision reasoning, and millisecond-level latency.',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Buildathon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-900 text-xs text-gray-300 mb-8">
            <svg
              className="w-4 h-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Razorpay AI Buildathon &mdash; Track 01
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Arova
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-indigo-400 font-medium">
            The Missing On-Ramp for Agentic Commerce
          </p>
          <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Make your Razorpay store discoverable and transactable by AI buyer
            agents. 80% deterministic logic, 20% AI intelligence.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/demo"
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-colors"
            >
              Try Demo
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium text-sm hover:bg-gray-900 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          Built for Razorpay AI Buildathon Track 01 &mdash; Agentic Commerce
          On-Ramp
        </p>
      </footer>
    </div>
  );
}
