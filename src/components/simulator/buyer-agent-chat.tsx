'use client';

import { useEffect, useRef } from 'react';
import { BuyerAgentStep } from '@/lib/ai/buyer-agent';

interface Message {
  role: 'user' | 'agent';
  content: string;
  step?: BuyerAgentStep;
}

interface Props {
  messages: Message[];
}

export default function BuyerAgentChat({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Enter your purchase intent to start the simulation
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-100'
            }`}
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>
            {msg.step && (
              <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2 text-xs">
                <span className="text-gray-400">
                  {msg.step.latency_ms}ms
                </span>
                {msg.step.ai_involved ? (
                  <span className="px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400 font-medium">
                    AI: {msg.step.ai_model}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-green-600/20 text-green-400 font-medium">
                    Deterministic
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
