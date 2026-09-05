import { callGroq } from '@/lib/ai/groq';
import { AIServiceError } from '@/lib/utils/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BuyerAgentStep {
  step: number;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  data: any;
  ai_involved: boolean;
  ai_model?: string;
  reasoning?: string;
  latency_ms: number;
}

interface DiscoverResponse {
  merchant: { name: string; slug: string; business_type: string };
  protocol_version: string;
  capabilities: string[];
  categories: string[];
  currency: string;
  endpoints: Record<string, string>;
}

interface QueryResponse {
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    attributes: Record<string, any>;
  }>;
  count: number;
  method_used: string;
}

interface NegotiateResponse {
  status: 'accepted' | 'counter_offer' | 'rejected';
  final_price?: number;
  counter_offer?: number;
  reasoning: string;
}

interface CheckoutResponse {
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  payment_link_url: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

function parseJsonFromLlm(raw: string): any {
  let cleaned = raw.trim();
  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  // Try to extract JSON object from text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(cleaned);
}

async function callGroqWithRetry(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number }
): Promise<any> {
  // First attempt
  try {
    const raw = await callGroq(messages, options);
    return parseJsonFromLlm(raw);
  } catch (firstError) {
    // Retry once
    try {
      const retryMessages = [
        ...messages,
        {
          role: 'user' as const,
          content:
            'Your previous response was not valid JSON. Please return ONLY valid JSON with no extra text or markdown.',
        },
      ];
      const raw = await callGroq(retryMessages, options);
      return parseJsonFromLlm(raw);
    } catch (retryError) {
      throw new AIServiceError(
        `Groq JSON parse failed after retry: ${retryError instanceof Error ? retryError.message : String(retryError)}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Buyer Agent Generator
// ---------------------------------------------------------------------------

export async function* runBuyerAgent(
  intent: string,
  merchantSlug: string
): AsyncGenerator<BuyerAgentStep> {
  const baseUrl = getBaseUrl();

  // =========================================================================
  // Step 1: DISCOVER
  // =========================================================================
  let discoverData: DiscoverResponse | null = null;
  {
    const stepStart = Date.now();
    try {
      const res = await fetch(
        `${baseUrl}/api/agent/discover?slug=${encodeURIComponent(merchantSlug)}`
      );

      if (!res.ok) {
        throw new Error(`Discovery failed with status ${res.status}`);
      }

      discoverData = (await res.json()) as DiscoverResponse;

      yield {
        step: 1,
        name: 'DISCOVER',
        status: 'complete',
        data: discoverData,
        ai_involved: false,
        latency_ms: Date.now() - stepStart,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      yield {
        step: 1,
        name: 'DISCOVER',
        status: 'error',
        data: { error: msg },
        ai_involved: false,
        latency_ms: Date.now() - stepStart,
      };
      return; // Cannot continue without discovery
    }
  }

  // =========================================================================
  // Step 2: QUERY
  // =========================================================================
  let queryData: QueryResponse | null = null;
  {
    const stepStart = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/agent/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: merchantSlug,
          query: intent,
        }),
      });

      if (!res.ok) {
        throw new Error(`Query failed with status ${res.status}`);
      }

      queryData = (await res.json()) as QueryResponse;

      yield {
        step: 2,
        name: 'QUERY',
        status: 'complete',
        data: queryData,
        ai_involved: queryData.method_used === 'semantic_search',
        ai_model:
          queryData.method_used === 'semantic_search'
            ? 'gemini-2.0-flash'
            : undefined,
        reasoning: `Found ${queryData.count} products via ${queryData.method_used}`,
        latency_ms: Date.now() - stepStart,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      yield {
        step: 2,
        name: 'QUERY',
        status: 'error',
        data: { error: msg },
        ai_involved: false,
        latency_ms: Date.now() - stepStart,
      };
      return; // Cannot continue without products
    }
  }

  if (!queryData || queryData.products.length === 0) {
    yield {
      step: 3,
      name: 'SELECT',
      status: 'error',
      data: { error: 'No products found matching the intent' },
      ai_involved: false,
      latency_ms: 0,
    };
    return;
  }

  // =========================================================================
  // Step 3: SELECT (Groq AI)
  // =========================================================================
  let selectedProduct: QueryResponse['products'][0] | null = null;
  {
    const stepStart = Date.now();
    try {
      // If only one product, select it directly without AI
      if (queryData.products.length === 1) {
        selectedProduct = queryData.products[0];
        yield {
          step: 3,
          name: 'SELECT',
          status: 'complete',
          data: { product: selectedProduct, reasoning: 'Only one product available' },
          ai_involved: false,
          latency_ms: Date.now() - stepStart,
        };
      } else {
        const productsSummary = queryData.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
        }));

        const selectResult = await callGroqWithRetry(
          [
            {
              role: 'system',
              content:
                'You are a buyer agent. Select the best product for the buyer. Return ONLY valid JSON: { "product_id": "<id>", "reasoning": "<why>" }',
            },
            {
              role: 'user',
              content: `Buyer intent: "${intent}"\n\nAvailable products:\n${JSON.stringify(productsSummary, null, 2)}\n\nWhich product best matches the buyer's intent?`,
            },
          ],
          { temperature: 0.3, max_tokens: 512 }
        );

        const chosen = queryData.products.find(
          (p) => p.id === selectResult.product_id
        );
        selectedProduct = chosen ?? queryData.products[0];

        yield {
          step: 3,
          name: 'SELECT',
          status: 'complete',
          data: { product: selectedProduct },
          ai_involved: true,
          ai_model: 'llama-3.3-70b-versatile',
          reasoning: selectResult.reasoning ?? 'AI selected best match',
          latency_ms: Date.now() - stepStart,
        };
      }
    } catch (error) {
      // Fallback: pick the first product
      selectedProduct = queryData.products[0];
      const msg = error instanceof Error ? error.message : String(error);

      yield {
        step: 3,
        name: 'SELECT',
        status: 'complete',
        data: {
          product: selectedProduct,
          fallback: true,
          error: msg,
        },
        ai_involved: false,
        reasoning: 'AI selection failed, defaulting to first product',
        latency_ms: Date.now() - stepStart,
      };
    }
  }

  // =========================================================================
  // Step 4: NEGOTIATE (Groq AI decides whether to negotiate)
  // =========================================================================
  let agreedPrice = selectedProduct.price;
  {
    const stepStart = Date.now();
    try {
      // Ask Groq whether to negotiate
      const negotiateDecision = await callGroqWithRetry(
        [
          {
            role: 'system',
            content:
              'You are a buyer agent deciding whether to negotiate. Return ONLY valid JSON: { "should_negotiate": true/false, "proposed_price": <number or null>, "reasoning": "<why>" }',
          },
          {
            role: 'user',
            content: `Product: "${selectedProduct.name}" priced at ${selectedProduct.price} INR.\nBuyer intent: "${intent}"\n\nShould the buyer attempt to negotiate the price? If yes, what price should be proposed? Consider that negotiation is worthwhile if a discount of 5-15% seems reasonable.`,
          },
        ],
        { temperature: 0.4, max_tokens: 256 }
      );

      if (
        negotiateDecision.should_negotiate &&
        typeof negotiateDecision.proposed_price === 'number'
      ) {
        // Call the negotiate API
        const negRes = await fetch(`${baseUrl}/api/agent/negotiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: merchantSlug,
            product_id: selectedProduct.id,
            quantity: 1,
            proposed_price: negotiateDecision.proposed_price,
          }),
        });

        if (negRes.ok) {
          const negData = (await negRes.json()) as NegotiateResponse;

          if (negData.status === 'accepted' && negData.final_price) {
            agreedPrice = negData.final_price;
          } else if (negData.status === 'counter_offer' && negData.counter_offer) {
            // Accept the counter offer
            agreedPrice = negData.counter_offer;
          }
          // If rejected, keep the original price

          yield {
            step: 4,
            name: 'NEGOTIATE',
            status: 'complete',
            data: {
              negotiation_result: negData,
              original_price: selectedProduct.price,
              agreed_price: agreedPrice,
            },
            ai_involved: true,
            ai_model: 'llama-3.3-70b-versatile',
            reasoning: `${negData.status}: ${negData.reasoning}`,
            latency_ms: Date.now() - stepStart,
          };
        } else {
          // Negotiation API failed, skip negotiation
          yield {
            step: 4,
            name: 'NEGOTIATE',
            status: 'complete',
            data: {
              skipped: true,
              reason: 'Negotiation API returned error',
              agreed_price: agreedPrice,
            },
            ai_involved: true,
            ai_model: 'llama-3.3-70b-versatile',
            reasoning: negotiateDecision.reasoning,
            latency_ms: Date.now() - stepStart,
          };
        }
      } else {
        // AI decided not to negotiate
        yield {
          step: 4,
          name: 'NEGOTIATE',
          status: 'complete',
          data: {
            skipped: true,
            reason: 'Price is acceptable',
            agreed_price: agreedPrice,
          },
          ai_involved: true,
          ai_model: 'llama-3.3-70b-versatile',
          reasoning: negotiateDecision.reasoning ?? 'Price within acceptable range',
          latency_ms: Date.now() - stepStart,
        };
      }
    } catch (error) {
      // Negotiation failure is non-fatal: continue with original price
      const msg = error instanceof Error ? error.message : String(error);
      yield {
        step: 4,
        name: 'NEGOTIATE',
        status: 'complete',
        data: {
          skipped: true,
          reason: `Negotiation error: ${msg}`,
          agreed_price: agreedPrice,
        },
        ai_involved: false,
        reasoning: 'Negotiation step failed gracefully, using listed price',
        latency_ms: Date.now() - stepStart,
      };
    }
  }

  // =========================================================================
  // Step 5: CHECKOUT (deterministic)
  // =========================================================================
  let checkoutData: CheckoutResponse | null = null;
  {
    const stepStart = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/agent/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: merchantSlug,
          items: [
            {
              product_id: selectedProduct.id,
              quantity: 1,
              agreed_price: agreedPrice,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Checkout failed with status ${res.status}`);
      }

      checkoutData = (await res.json()) as CheckoutResponse;

      yield {
        step: 5,
        name: 'CHECKOUT',
        status: 'complete',
        data: checkoutData,
        ai_involved: false,
        latency_ms: Date.now() - stepStart,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      yield {
        step: 5,
        name: 'CHECKOUT',
        status: 'error',
        data: { error: msg },
        ai_involved: false,
        latency_ms: Date.now() - stepStart,
      };
      return; // Cannot continue without checkout
    }
  }

  // =========================================================================
  // Step 6: PAYMENT (deterministic — return payment link)
  // =========================================================================
  {
    const stepStart = Date.now();
    yield {
      step: 6,
      name: 'PAYMENT',
      status: 'complete',
      data: {
        order_id: checkoutData.order_id,
        razorpay_order_id: checkoutData.razorpay_order_id,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        payment_link_url: checkoutData.payment_link_url,
      },
      ai_involved: false,
      reasoning: 'Payment link generated via Razorpay',
      latency_ms: Date.now() - stepStart,
    };
  }
}
