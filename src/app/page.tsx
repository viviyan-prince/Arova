'use client';

import Link from 'next/link';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { LiveCommerceDemo } from '@/components/landing/live-commerce-demo';
import { TransactionJourney } from '@/components/landing/transaction-journey';
import { AnimatedFlow } from '@/components/landing/animated-flow';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-foreground flex flex-col relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[#6B5EFF]/5 via-transparent to-transparent opacity-40" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(107, 94, 255, 0.03) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-[#1F1F28] bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B5EFF] to-[#8B7EFF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-[17px] font-semibold tracking-tight">Arova</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher compact />
            <Link
              href="/demo"
              className="text-[14px] text-[#94949C] hover:text-foreground transition-colors px-3 py-2"
            >
              Demo
            </Link>
            <Link
              href="/dashboard"
              className="text-[14px] font-medium bg-white text-[#0A0A0F] hover:bg-white/90 px-5 py-2 rounded-lg transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 min-h-[95vh]">
        <div className="max-w-6xl mx-auto w-full">
          {/* Category label */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1F1F28] bg-[#13131A]/60 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6B5EFF] animate-pulse" />
              <span className="text-[12px] font-medium text-[#94949C] tracking-wide">
                Intelligence Layer for AI Commerce
              </span>
            </div>
          </div>

          {/* Editorial headline */}
          <h1 className="text-center mb-8 animate-fade-in">
            <span className="block text-[72px] sm:text-[80px] lg:text-[88px] font-bold tracking-[-0.04em] leading-[0.95] text-foreground">
              Turn AI Shopping
            </span>
            <span className="block text-[72px] sm:text-[80px] lg:text-[88px] font-bold tracking-[-0.04em] leading-[0.95]">
              <span className="bg-gradient-to-r from-[#6B5EFF] via-[#8B7EFF] to-[#6B5EFF] bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer">
                Into Merchant Revenue
              </span>
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-center text-[18px] text-[#94949C] max-w-2xl mx-auto leading-relaxed mb-12">
            Arova connects AI buyer agents to your Razorpay store—turning natural language shopping into controlled transactions.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mb-20">
            <Link href="/dashboard">
              <MagneticButton variant="primary" className="px-8 py-3 text-[15px]">
                Start Building
              </MagneticButton>
            </Link>
            <Link href="/demo">
              <MagneticButton variant="secondary" className="px-8 py-3 text-[15px]">
                Watch AI Shopper
              </MagneticButton>
            </Link>
          </div>

          {/* Hero visual - animated transaction flow */}
          <AnimatedFlow />
        </div>
      </section>

      {/* Live Commerce Intelligence */}
      <LiveCommerceDemo />

      {/* Transaction Journey */}
      <TransactionJourney />

      {/* Trust foundation */}
      <section className="px-6 py-24 border-t border-[#1F1F28]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[#6B5EFF]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#6B5EFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">AI Discovery</h3>
              <p className="text-[14px] text-[#94949C] leading-relaxed">
                Natural language shopping meets your product catalog
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[#6B5EFF]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#6B5EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">Merchant Rules</h3>
              <p className="text-[14px] text-[#94949C] leading-relaxed">
                Control pricing, inventory, and approval without touching code
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[#00D98E]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#00D98E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">Razorpay Native</h3>
              <p className="text-[14px] text-[#94949C] leading-relaxed">
                Secure orders, payments and settlements you already trust
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-[#1F1F28]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Ready for AI commerce
          </h2>
          <p className="text-[16px] text-[#94949C] mb-10 leading-relaxed">
            Connect your store to Arova and make it discoverable to the next generation of AI buyers.
          </p>
          <Link href="/dashboard">
            <MagneticButton variant="primary" className="px-8 py-3 text-[15px]">
              Start Building
            </MagneticButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-[#1F1F28]">
        <p className="text-[13px] text-[#54545C] text-center">
          Built for Razorpay AI Buildathon — Track 01: Agentic Payments
        </p>
      </footer>
    </div>
  );
}
