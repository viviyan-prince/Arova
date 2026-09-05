'use client';

import { useState } from 'react';
import BuyerAgentChat from '@/components/simulator/buyer-agent-chat';
import StepVisualizer from '@/components/simulator/step-visualizer';
import AgentIdentityCard from '@/components/simulator/agent-identity-card';
import { BuyerAgentStep } from '@/lib/ai/buyer-agent';
import Link from 'next/link';
import { MagneticButton } from '@/components/ui/magnetic-button';

export default function DemoPage() {
  const [intent, setIntent] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<BuyerAgentStep[]>([]);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string; step?: BuyerAgentStep }>>([]);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [trustScore, setTrustScore] = useState(50);

  const runSimulation = async () => {
    if (!intent.trim() || isRunning) return;

    setIsRunning(true);
    setSteps([]);
    setMessages([{ role: 'user', content: intent }]);

    try {
      const response = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: intent.trim(),
          merchant_slug: 'sportkart',
        }),
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const step = JSON.parse(line.slice(6)) as BuyerAgentStep;

              setSteps((prev) => {
                const existing = prev.find((s) => s.step === step.step);
                if (existing) {
                  return prev.map((s) => (s.step === step.step ? step : s));
                }
                return [...prev, step];
              });

              if (step.status === 'complete') {
                let content = '';
                switch (step.name) {
                  case 'DISCOVER':
                    content = `Connected to ${step.data.merchant?.name || 'merchant'}. Capabilities loaded.`;
                    break;
                  case 'QUERY':
                    content = `Found ${step.data.count || 0} products matching your request.`;
                    break;
                  case 'SELECT':
                    content = `Selected: ${step.data.product?.name || 'product'} at ₹${step.data.product?.price || 0}`;
                    break;
                  case 'NEGOTIATE':
                    if (step.data.skipped) {
                      content = `Price acceptable. Proceeding at ₹${step.data.agreed_price}`;
                    } else {
                      const negotiation = step.data.negotiation_result;
                      const originalPrice = step.data.original_price || 0;
                      const finalPrice = step.data.agreed_price || 0;
                      const discount = originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

                      if (negotiation?.status === 'accepted' && discount > 0) {
                        content = `✅ Negotiation successful!\n\nOriginal Price: ₹${originalPrice}\nDiscount: ${discount}%\nFinal Price: ₹${finalPrice}\n\n${negotiation.reasoning || ''}`;
                      } else if (negotiation?.status === 'accepted') {
                        content = `✅ Price accepted at ₹${finalPrice}`;
                      } else if (negotiation?.status === 'counter_offer') {
                        content = `💬 Counter-offer: ₹${negotiation.counter_offer}\n\n${negotiation.reasoning || ''}`;
                      } else if (negotiation?.status === 'rejected') {
                        content = `❌ Negotiation rejected\n\n${negotiation.reasoning || ''}`;
                      } else {
                        content = `Negotiation ${negotiation?.status}: Final price ₹${finalPrice}`;
                      }
                    }
                    break;
                  case 'CHECKOUT':
                    content = `Order created: ${step.data.order_id}`;
                    break;
                  case 'PAYMENT':
                    content = `Payment link ready. Amount: ₹${step.data.amount / 100}`;
                    break;
                }

                setMessages((prev) => [...prev, { role: 'agent', content, step }]);

                if (step.step === 6 && step.status === 'complete') {
                  setTrustScore((prev) => Math.min(100, prev + 10));
                }
              }

              if (step.status === 'error') {
                setMessages((prev) => [
                  ...prev,
                  { role: 'agent', content: `Error at ${step.name}: ${step.data.error || 'Unknown error'}`, step },
                ]);
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', line, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Simulation error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: `Simulation failed: ${error instanceof Error ? error.message : String(error)}`,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSimulation();
  };

  const suggestions = [
    'running shoes under 5000',
    'gym gloves',
    'yoga mat for beginners',
    'water bottle for cycling',
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl px-6 h-14 flex items-center shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight">Arova</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-[13px] text-zinc-500">Buyer Agent Simulation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-600 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800/60">
              Razorpay Test Mode
            </span>
            <Link
              href="/dashboard"
              className="text-[13px] text-zinc-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 max-w-7xl mx-auto w-full flex gap-5 p-5">
          {/* Left: Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/40 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-zinc-300">Agent Conversation</h2>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Processing
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-zinc-300 mb-1">Start a simulation</p>
                    <p className="text-[12px] text-zinc-500 max-w-xs mb-5">
                      Tell the AI buyer agent what you want to purchase.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map((s, idx) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setIntent(s); }}
                          className="text-[12px] text-zinc-400 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 hover:border-zinc-600/40 px-3 py-1.5 rounded-lg border-transition stagger-item"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <BuyerAgentChat messages={messages} />
                )}
              </div>

              <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-zinc-800/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="What would you like to buy?"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-zinc-600 focus-ring focus:border-indigo-500/40 border-transition"
                    disabled={isRunning}
                  />
                  <MagneticButton
                    type="submit"
                    disabled={isRunning || !intent.trim()}
                    variant="primary"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running
                      </>
                    ) : (
                      'Send'
                    )}
                  </MagneticButton>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Pipeline + Agent Card */}
          <div className="w-72 flex flex-col gap-4 shrink-0">
            <AgentIdentityCard
              sessionId={sessionId}
              trustScore={trustScore}
              status={isRunning ? 'active' : steps.length > 0 ? 'completed' : 'ready'}
            />
            <StepVisualizer steps={steps} />
          </div>
        </div>
      </div>
    </div>
  );
}
