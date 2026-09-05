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

  return (
    <div className="p-4 space-y-3">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          style={{ animationDelay: `${idx * 30}ms` }}
        >
          <div
            className={`max-w-[80%] rounded-xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-accent text-foreground'
                : 'bg-surface-raised text-foreground border border-border'
            }`}
          >
            <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
            {msg.step && (
              <div className="mt-2 pt-2 border-t border-foreground/10 flex items-center gap-2 text-[11px]">
                <span className="text-foreground/50 font-mono">
                  {msg.step.latency_ms}ms
                </span>
                {msg.step.ai_involved ? (
                  <span className="px-1.5 py-0.5 rounded bg-ai-subtle text-ai font-medium">
                    AI: {msg.step.ai_model}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-deterministic-subtle text-deterministic font-medium">
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
