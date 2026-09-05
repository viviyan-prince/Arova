'use client';

import { useState, useEffect } from 'react';

export function LiveCommerceDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(0);

  const products = [
    { name: 'Nike Air Zoom Pegasus', price: 4899, image: '👟', stock: 12 },
    { name: 'Adidas Ultraboost', price: 5299, image: '👟', stock: 8 },
    { name: 'Puma RS-X', price: 3799, image: '👟', stock: 15 },
  ];

  const steps = [
    { label: 'Intent Detected', detail: 'Natural language query parsed', color: '#6B5EFF' },
    { label: 'Products Matched', detail: '3 items in budget range', color: '#6B5EFF' },
    { label: 'Rules Applied', detail: 'Inventory & pricing verified', color: '#8B7EFF' },
    { label: 'Payment Ready', detail: 'Razorpay order created', color: '#00D98E' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
      if (activeStep === 1) {
        const productTimer = setInterval(() => {
          setSelectedProduct((p) => (p < products.length - 1 ? p + 1 : 0));
        }, 1200);
        return () => clearInterval(productTimer);
      }
    }, 2400);
    return () => clearInterval(timer);
  }, [activeStep, steps.length, products.length]);

  return (
    <section className="px-6 py-32 border-t border-[#1F1F28] relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(107, 94, 255, 0.08) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1F1F28] bg-[#13131A]/60 backdrop-blur-sm mb-6">
            <span className="text-[12px] font-medium text-[#94949C] tracking-wide">
              Live Intelligence Layer
            </span>
          </div>
          <h2 className="text-[48px] font-bold text-foreground mb-4 tracking-tight leading-[1.1]">
            Watch AI shopping<br />become merchant revenue
          </h2>
          <p className="text-[16px] text-[#94949C] max-w-2xl mx-auto leading-relaxed">
            Left: What the AI shopper sees. Right: How Arova controls the transaction.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: AI Shopper Experience */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#6B5EFF]/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-[#13131A] border border-[#1F1F28] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B5EFF] to-[#8B7EFF] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">AI Shopper</p>
                  <p className="text-[13px] text-[#94949C]">Autonomous buyer agent</p>
                </div>
              </div>

              {/* Query */}
              <div className="bg-[#0A0A0F] border border-[#1F1F28] rounded-xl p-5 mb-6">
                <p className="text-[14px] text-[#94949C] mb-2">Looking for:</p>
                <p className="text-[16px] text-foreground font-medium">"Running shoes under ₹5,000"</p>
              </div>

              {/* Products */}
              <div className="space-y-3">
                {products.map((product, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      activeStep >= 1 && idx === selectedProduct
                        ? 'bg-[#6B5EFF]/10 border-[#6B5EFF]/30 scale-[1.02]'
                        : 'bg-[#0A0A0F] border-[#1F1F28] opacity-60'
                    }`}
                  >
                    <div className="text-4xl">{product.image}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">{product.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[13px] font-mono text-[#00D98E]">₹{product.price}</span>
                        <span className="text-[12px] text-[#94949C]">{product.stock} in stock</span>
                      </div>
                    </div>
                    {activeStep >= 1 && idx === selectedProduct && (
                      <div className="w-2 h-2 rounded-full bg-[#6B5EFF] animate-pulse" />
                    )}
                  </div>
                ))}
              </div>

              {/* Action */}
              {activeStep >= 2 && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#00D98E]/10 to-[#00D98E]/5 border border-[#00D98E]/20 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#00D98E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <div>
                      <p className="text-[13px] font-medium text-[#00D98E]">Ready to purchase</p>
                      <p className="text-[12px] text-[#94949C]">All merchant rules satisfied</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Arova Control Panel */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#00D98E]/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-[#13131A] border border-[#1F1F28] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D98E] to-[#34D9A3] flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Arova Intelligence</p>
                  <p className="text-[13px] text-[#94949C]">Merchant control layer</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`relative transition-all duration-500 ${
                      idx <= activeStep ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div className="absolute left-[19px] top-[48px] w-[2px] h-8 bg-gradient-to-b from-[#1F1F28] to-transparent" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Status indicator */}
                      <div
                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                          idx === activeStep
                            ? 'border-[#6B5EFF] bg-[#6B5EFF]/10 scale-110'
                            : idx < activeStep
                            ? 'border-[#00D98E] bg-[#00D98E]/10'
                            : 'border-[#1F1F28] bg-[#0A0A0F]'
                        }`}
                      >
                        {idx < activeStep ? (
                          <svg className="w-5 h-5 text-[#00D98E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : idx === activeStep ? (
                          <div className="w-2 h-2 rounded-full bg-[#6B5EFF] animate-pulse" />
                        ) : (
                          <span className="text-[12px] text-[#54545C] font-medium">{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1.5">
                        <p className={`text-[15px] font-semibold mb-1 transition-colors ${
                          idx <= activeStep ? 'text-foreground' : 'text-[#54545C]'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-[13px] text-[#94949C]">{step.detail}</p>
                      </div>

                      {/* Processing indicator */}
                      {idx === activeStep && (
                        <div className="pt-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#6B5EFF] animate-pulse"
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Result */}
              {activeStep === steps.length - 1 && (
                <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-[#00D98E]/10 to-[#00D98E]/5 border border-[#00D98E]/20 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-[#94949C]">Razorpay Order</span>
                    <span className="text-[11px] font-mono text-[#6B5EFF] bg-[#6B5EFF]/10 px-2 py-1 rounded">
                      order_abc123
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[32px] font-bold font-mono text-[#00D98E]">₹4,899</span>
                    <span className="text-[14px] text-[#94949C]">ready for payment</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#13131A]/60 border border-[#1F1F28] backdrop-blur-sm">
            <svg className="w-5 h-5 text-[#6B5EFF]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="text-[13px] font-medium text-foreground">Intelligence + Control</p>
              <p className="text-[12px] text-[#94949C]">AI discovers, your rules decide, Razorpay secures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
