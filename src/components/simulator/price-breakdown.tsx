'use client';

interface PriceBreakdownProps {
  originalPrice: number;
  finalPrice: number;
  status: 'accepted' | 'counter_offer' | 'rejected';
  reasoning?: string;
}

export function PriceBreakdown({ originalPrice, finalPrice, status, reasoning }: PriceBreakdownProps) {
  const discount = originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
  const savings = originalPrice - finalPrice;

  if (status === 'rejected') {
    return (
      <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-red-300">Negotiation Rejected</p>
            {reasoning && (
              <p className="text-[11px] text-red-400/80 mt-1 leading-relaxed">{reasoning}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'counter_offer') {
    return (
      <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-amber-300">Counter Offer</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Original Price</span>
                <span className="text-zinc-300 font-mono">₹{originalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Counter Price</span>
                <span className="text-amber-300 font-mono font-medium">₹{finalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {reasoning && (
              <p className="text-[11px] text-amber-400/80 mt-2 leading-relaxed">{reasoning}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (discount === 0) {
    return (
      <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-emerald-300">Price Accepted</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Final Price</span>
              <span className="text-[13px] text-emerald-300 font-mono font-medium">₹{finalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
      <div className="flex items-start gap-2">
        <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-emerald-300">Negotiation Successful!</p>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
              {discount}% OFF
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Original Price</span>
              <span className="text-zinc-400 font-mono line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400">Discount</span>
              <span className="text-emerald-400 font-mono font-medium">-₹{savings.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-1.5 border-t border-emerald-500/20 flex items-center justify-between">
              <span className="text-[12px] font-medium text-zinc-200">Final Price</span>
              <span className="text-[15px] text-emerald-300 font-mono font-bold">₹{finalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {reasoning && (
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{reasoning}</p>
          )}
        </div>
      </div>
    </div>
  );
}
