import { NextResponse } from 'next/server';
import { runBuyerAgent } from '@/lib/ai/buyer-agent';
import type { BuyerAgentStep } from '@/lib/ai/buyer-agent';

// ---------------------------------------------------------------------------
// POST /api/simulator/run
//
// Accepts { intent, merchant_slug } in the body.
// Returns a Server-Sent Events (SSE) stream where each event is one step
// yielded by the buyer agent async generator.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { intent, merchant_slug } = body;

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "intent" in request body.' },
        { status: 400 },
      );
    }

    if (!merchant_slug || typeof merchant_slug !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "merchant_slug" in request body.' },
        { status: 400 },
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator: AsyncGenerator<BuyerAgentStep> = runBuyerAgent(
            intent,
            merchant_slug,
          );

          for await (const step of generator) {
            const ssePayload = `data: ${JSON.stringify(step)}\n\n`;
            controller.enqueue(encoder.encode(ssePayload));
          }

          // Signal completion
          const donePayload = `data: ${JSON.stringify({ done: true })}\n\n`;
          controller.enqueue(encoder.encode(donePayload));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown simulation error';

          const errorPayload = `data: ${JSON.stringify({
            step: -1,
            name: 'ERROR',
            status: 'error',
            data: { error: message },
            ai_involved: false,
            latency_ms: 0,
          })}\n\n`;

          controller.enqueue(encoder.encode(errorPayload));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Simulator] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
