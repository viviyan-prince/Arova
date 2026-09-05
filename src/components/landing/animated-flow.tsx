'use client';

import { useState, useEffect } from 'react';

export function AnimatedFlow() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nodes = [
    { label: 'AI Intent' },
    { label: 'Discovery' },
    { label: 'Rules' },
    { label: 'Razorpay' },
    { label: '₹4,299', isFinal: true },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % nodes.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [nodes.length]);

  return (
    <div className="relative max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-center gap-3 text-[13px] font-medium">
        {nodes.map((node, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-lg border transition-all duration-500 ${
                idx === activeIndex
                  ? node.isFinal
                    ? 'bg-gradient-to-r from-[#00D98E]/10 to-[#00D98E]/5 border-[#00D98E]/30 text-[#00D98E] font-semibold scale-105'
                    : 'bg-[#6B5EFF]/10 border-[#6B5EFF]/30 text-foreground scale-105'
                  : idx < activeIndex
                  ? 'bg-[#13131A] border-[#1F1F28] text-[#94949C]'
                  : 'bg-[#0A0A0F] border-[#1F1F28] text-[#54545C]'
              }`}
            >
              {node.isFinal && idx === activeIndex ? (
                <span className="font-mono">{node.label}</span>
              ) : (
                node.label
              )}
            </div>

            {idx < nodes.length - 1 && (
              <svg
                className="w-6 h-6 transition-colors duration-500"
                style={{
                  color: idx < activeIndex
                    ? idx === nodes.length - 2
                      ? '#00D98E'
                      : '#6B5EFF'
                    : '#1F1F28',
                }}
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
    </div>
  );
}
