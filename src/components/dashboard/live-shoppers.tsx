'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Shopper {
  id: number;
  query: string;
  product: string;
  originalPrice: string;
  finalPrice: string;
  hasDiscount: boolean;
  rule: string;
  step: 'Discovering' | 'Negotiating' | 'Checkout';
}

const SHOPPERS: Shopper[] = [
  {
    id: 1,
    query: 'Running shoes for daily training under ₹5,000',
    product: 'ASICS Gel-Contend 9',
    originalPrice: '₹5,499',
    finalPrice: '₹4,299',
    hasDiscount: true,
    rule: 'Max 22% discount',
    step: 'Checkout',
  },
  {
    id: 2,
    query: 'Best gym gloves for beginners',
    product: 'Pro Training Gloves',
    originalPrice: '₹1,299',
    finalPrice: '₹1,099',
    hasDiscount: true,
    rule: '15% on accessories',
    step: 'Negotiating',
  },
  {
    id: 3,
    query: 'Yoga mat, eco-friendly',
    product: 'EcoFlex Yoga Mat',
    originalPrice: '₹2,499',
    finalPrice: '₹2,499',
    hasDiscount: false,
    rule: '',
    step: 'Discovering',
  },
];

const STEPS = ['Discovering', 'Negotiating', 'Checkout'] as const;

export function LiveShoppers() {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightedIndex((prev) => (prev + 1) % SHOPPERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Live AI shoppers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simulated autonomous shopping sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="demo-badge">Demo data</span>
          <Link
            href="/demo"
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            View AI shopper
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SHOPPERS.map((shopper, idx) => (
          <ShopperCard
            key={shopper.id}
            shopper={shopper}
            highlighted={idx === highlightedIndex}
          />
        ))}
      </div>
    </div>
  );
}

function ShopperCard({
  shopper,
  highlighted,
}: {
  shopper: Shopper;
  highlighted: boolean;
}) {
  const currentStepIdx = STEPS.indexOf(shopper.step);

  return (
    <div
      className={`premium-card bg-surface-raised border rounded-lg p-4 transition-all duration-300 stagger-item animate-slide-down ${
        highlighted ? 'border-accent/30' : 'border-border'
      }`}
    >
      {/* Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-success ${
              highlighted ? 'live-pulse' : ''
            }`}
          />
          <span className="text-[11px] text-success font-medium">Active</span>
        </span>
        <span className="ai-indicator text-[11px] text-muted">AI Shopper #{shopper.id}</span>
      </div>

      {/* Query */}
      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
        &ldquo;{shopper.query}&rdquo;
      </p>

      {/* Product matched */}
      <p className="text-sm font-medium text-foreground mb-2">{shopper.product}</p>

      {/* Price */}
      <div className="flex items-center gap-2 mb-2">
        {shopper.hasDiscount ? (
          <>
            <span className="text-xs text-muted line-through">
              {shopper.originalPrice}
            </span>
            <span className="text-xs text-revenue font-medium">
              {shopper.finalPrice}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            {shopper.originalPrice}
          </span>
        )}
      </div>

      {/* Rule */}
      {shopper.rule && (
        <p className="text-[11px] text-muted-foreground mb-3">
          Rule:{' '}
          <span className="text-deterministic">{shopper.rule}</span>
        </p>
      )}

      {/* Step progress */}
      <div className="flex items-center gap-1.5 mt-3">
        {STEPS.map((s, idx) => {
          const isComplete = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          return (
            <div key={s} className="flex items-center gap-1.5 flex-1">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  isComplete || isCurrent ? 'bg-accent' : 'bg-border'
                }`}
              />
              {isCurrent && (
                <span className="text-[10px] text-accent font-medium whitespace-nowrap">
                  {s}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
