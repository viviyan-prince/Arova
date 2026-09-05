'use client';

import { useState } from 'react';
import BuyerAgentChat from '@/components/simulator/buyer-agent-chat';
import StepVisualizer from '@/components/simulator/step-visualizer';
import AgentIdentityCard from '@/components/simulator/agent-identity-card';
import { BuyerAgentStep } from '@/lib/ai/buyer-agent';

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

              // Add agent message for completed steps
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
                      content = `Negotiation ${step.data.negotiation_result?.status}: Final price ₹${step.data.agreed_price}`;
                    }
                    break;
                  case 'CHECKOUT':
                    content = `Order created: ${step.data.order_id}`;
                    break;
                  case 'PAYMENT':
                    content = `Payment link generated. Amount: ₹${step.data.amount / 100}`;
                    break;
                }

                setMessages((prev) => [...prev, { role: 'agent', content, step }]);

                // Update trust score on successful completion
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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Arova Demo</h1>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400">AI Buyer Agent Simulation</span>
          </div>
          <div className="text-xs text-gray-500 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            Powered by Razorpay Test Mode
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 max-w-7xl mx-auto w-full flex gap-6 p-6">
          {/* Left: Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-300">Agent Conversation</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <BuyerAgentChat messages={messages} />
              </div>
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="What would you like to buy? (e.g., running shoes under 1500)"
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-600"
                    disabled={isRunning}
                  />
                  <button
                    type="submit"
                    disabled={isRunning || !intent.trim()}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRunning ? 'Running...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Pipeline + Agent Card */}
          <div className="w-80 flex flex-col gap-6">
            <AgentIdentityCard sessionId={sessionId} trustScore={trustScore} status={isRunning ? 'active' : steps.length > 0 ? 'completed' : 'ready'} />
            <StepVisualizer steps={steps} />
          </div>
        </div>
      </div>
    </div>
  );
}
