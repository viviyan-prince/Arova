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
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

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

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIntent(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      const newRecognition = initSpeechRecognition();
      if (!newRecognition) {
        alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }
      setRecognition(newRecognition);
      newRecognition.start();
      setIsListening(true);
    } else {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl px-6 h-14 flex items-center shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-foreground text-xs font-bold">A</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight">Arova</span>
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-medium text-foreground/80">AI Shopper</span>
              <span className="text-[11px] text-muted hidden sm:inline">Experience what your store looks like to an autonomous buyer.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-warning bg-warning-subtle px-3 py-1.5 rounded-full border border-warning/20">
              Razorpay Test Mode
            </span>
            <Link
              href="/dashboard"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
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
            <div className="flex-1 bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-foreground/80">Agent Conversation</h2>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[11px] text-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Processing
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-surface-raised flex items-center justify-center mb-5">
                      <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium text-foreground mb-1">Try your store as an AI shopper</p>
                    <p className="text-[13px] text-muted-foreground max-w-sm mb-6">
                      Enter what you&apos;re looking for and watch Arova find, negotiate, and purchase.
                    </p>
                    <div className="flex flex-wrap gap-2.5 justify-center">
                      {suggestions.map((s, idx) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setIntent(s); }}
                          className="text-[13px] text-muted-foreground bg-surface-raised hover:bg-surface-raised/80 border border-border hover:border-border/80 px-4 py-2.5 rounded-xl border-transition stagger-item"
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

              <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border-subtle">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      placeholder="What would you like to buy?"
                      className="w-full bg-background border border-border rounded-lg pl-4 pr-12 py-2.5 text-[13px] text-foreground placeholder-muted focus-ring focus:border-accent/40 border-transition"
                      disabled={isRunning}
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      disabled={isRunning}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 focus-ring ${
                        isListening
                          ? 'bg-accent text-white animate-pulse'
                          : 'text-muted-foreground hover:text-accent hover:bg-accent-subtle'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title={isListening ? 'Listening... Click to stop' : 'Click to use voice input'}
                    >
                      {isListening ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                          <circle cx="12" cy="11" r="2" opacity="0.3">
                            <animate attributeName="r" values="2;3;2" dur="1s" repeatCount="indefinite"/>
                          </circle>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <MagneticButton
                    type="submit"
                    disabled={isRunning || !intent.trim()}
                    variant="primary"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
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
