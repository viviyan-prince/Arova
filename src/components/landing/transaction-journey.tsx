'use client';

import { useState, useEffect } from 'react';

export function TransactionJourney() {
  const [activeNode, setActiveNode] = useState(0);

  const nodes = [
    {
      icon: '🤖',
      label: 'AI Shopper',
      detail: 'Natural language query',
      color: '#6B5EFF'
    },
    {
      icon: '🔍',
      label: 'Discovery',
      detail: 'Semantic product match',
      color: '#6B5EFF'
    },
    {
      icon: '⚙️',
      label: 'Rules',
      detail: 'Merchant verification',
      color: '#8B7EFF'
    },
    {
      icon: '💳',
      label: 'Razorpay',
      detail: 'Secure payment',
      color: '#8B7EFF'
    },
    {
      icon: '✅',
      label: 'Revenue',
      detail: 'Settlement complete',
      color: '#00D98E'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNode((prev) => (prev < nodes.length - 1 ? prev + 1 : 0));
    }, 1800);
    return () => clearInterval(timer);
  }, [nodes.length]);

  return (
    <section className="px-6 py-32 bg-gradient-to-b from-transparent via-[#13131A]/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-bold text-foreground mb-4 tracking-tight leading-[1.1]">
            The complete transaction path
          </h2>
          <p className="text-[16px] text-[#94949C] max-w-2xl mx-auto leading-relaxed">
            From AI intent to merchant revenue, every step is visible and controlled.
          </p>
        </div>

        {/* Desktop: Horizontal flow */}
        <div className="hidden lg:flex items-center justify-between relative">
          {/* Connection line */}
          <div className="absolute inset-0 flex items-center px-20">
            <div className="w-full h-[2px] bg-gradient-to-r from-[#6B5EFF] via-[#8B7EFF] to-[#00D98E] opacity-20" />
          </div>

          {nodes.map((node, idx) => (
            <div key={idx} className="relative flex flex-col items-center gap-4 z-10">
              {/* Node */}
              <div
                className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                  idx === activeNode
                    ? 'bg-gradient-to-br from-[#6B5EFF]/20 to-[#00D98E]/20 border-[#6B5EFF] scale-110 shadow-lg shadow-[#6B5EFF]/20'
                    : idx < activeNode
                    ? 'bg-[#13131A] border-[#00D98E] opacity-100'
                    : 'bg-[#0A0A0F] border-[#1F1F28] opacity-40'
                }`}
              >
                <span className="text-4xl">{node.icon}</span>
              </div>

              {/* Label */}
              <div className="text-center min-w-[140px]">
                <p className={`text-[15px] font-semibold mb-1 transition-colors ${
                  idx <= activeNode ? 'text-foreground' : 'text-[#54545C]'
                }`}>
                  {node.label}
                </p>
                <p className="text-[12px] text-[#94949C]">{node.detail}</p>
              </div>

              {/* Active indicator */}
              {idx === activeNode && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 rounded-full bg-[#6B5EFF] animate-pulse" />
                </div>
              )}

              {/* Connector arrow */}
              {idx < nodes.length - 1 && (
                <svg
                  className={`absolute left-[calc(100%+1rem)] top-12 w-8 h-8 transition-all duration-500 ${
                    idx < activeNode ? 'text-[#00D98E]' : 'text-[#1F1F28]'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Vertical flow */}
        <div className="lg:hidden space-y-6">
          {nodes.map((node, idx) => (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < nodes.length - 1 && (
                <div className="absolute left-12 top-24 w-[2px] h-12 bg-gradient-to-b from-[#6B5EFF]/20 to-transparent" />
              )}

              <div className="flex items-start gap-6">
                {/* Node */}
                <div
                  className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${
                    idx === activeNode
                      ? 'bg-gradient-to-br from-[#6B5EFF]/20 to-[#00D98E]/20 border-[#6B5EFF] scale-110'
                      : idx < activeNode
                      ? 'bg-[#13131A] border-[#00D98E]'
                      : 'bg-[#0A0A0F] border-[#1F1F28] opacity-40'
                  }`}
                >
                  <span className="text-4xl">{node.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-6">
                  <p className={`text-[16px] font-semibold mb-1 transition-colors ${
                    idx <= activeNode ? 'text-foreground' : 'text-[#54545C]'
                  }`}>
                    {node.label}
                  </p>
                  <p className="text-[14px] text-[#94949C]">{node.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-[#13131A] border border-[#1F1F28]">
            <div className="text-[36px] font-bold font-mono text-[#6B5EFF] mb-1">~2.4s</div>
            <p className="text-[13px] text-[#94949C]">Average transaction time</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-[#13131A] border border-[#1F1F28]">
            <div className="text-[36px] font-bold font-mono text-[#8B7EFF] mb-1">100%</div>
            <p className="text-[13px] text-[#94949C]">Merchant rule compliance</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-[#13131A] border border-[#1F1F28]">
            <div className="text-[36px] font-bold font-mono text-[#00D98E] mb-1">Zero</div>
            <p className="text-[13px] text-[#94949C]">AI in payment logic</p>
          </div>
        </div>
      </div>
    </section>
  );
}
