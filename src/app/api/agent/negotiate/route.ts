import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { validateAgentNegotiate, validateMerchantSlug } from '@/lib/engine/validators';
import { negotiate } from '@/lib/engine/negotiation-engine';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { CompiledRule } from '@/types/transaction';
import type { AgentNegotiateResponse } from '@/types/agent-protocol';

// ---------------------------------------------------------------------------
// POST /api/agent/negotiate
//
// Deterministic price negotiation. The buyer agent proposes a price for a
// product; the engine evaluates it against the merchant's compiled commerce
// rules and returns accepted / counter_offer / rejected.
//
// AI is NEVER involved in negotiation -- all arithmetic is integer paise.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    // --- Parse & validate body ---
    const body = await request.json();
    const validation = validateAgentNegotiate(body);

    if (!validation.success) {
      throw new ValidationError(
        `Invalid negotiate request: ${validation.errors.join('; ')}`,
      );
    }
    const { slug, product_id, quantity, proposed_price, session_id } = validation.data;

    // --- Validate slug ---
    const slugResult = validateMerchantSlug(slug);
    if (!slugResult.success) {
      throw new ValidationError(slugResult.error);
    }

    const supabase = getServerSupabase();

    // --- Fetch merchant ---
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('agent_endpoint_slug', slug)
      .single();

    if (merchantError || !merchant) {
      throw new NotFoundError(`Merchant with slug "${slug}" not found.`);
    }

    // --- Fetch product ---
    const { data: product, error: productError } = await supabase
      .from('catalog_products')
      .select('id, price, is_active, merchant_id')
      .eq('id', product_id)
      .eq('merchant_id', merchant.id)
      .single();

    if (productError || !product) {
      throw new NotFoundError(
        `Product "${product_id}" not found for merchant "${slug}".`,
      );
    }

    if (!product.is_active) {
      throw new ValidationError('Product is not currently available.');
    }

    // --- Fetch commerce rules for this merchant ---
    const { data: rules, error: rulesError } = await supabase
      .from('commerce_rules')
      .select('*')
      .eq('merchant_id', merchant.id);

    if (rulesError) {
      console.error('[Negotiate] Failed to fetch rules:', rulesError.message);
    }

    const compiledRules: CompiledRule[] = (rules ?? [])
      .filter((r: any) => r.compiled_rule && r.is_active)
      .map((r: any) => ({
        id: r.id,
        type: r.compiled_rule.type,
        condition: r.compiled_rule.condition,
        action: r.compiled_rule.action,
        priority: r.priority ?? 0,
      }));

    // --- Run deterministic negotiation engine ---
    const result = negotiate({
      productPrice: product.price,
      proposedPrice: proposed_price,
      quantity,
      rules: compiledRules,
    });

    const response: AgentNegotiateResponse = {
      status: result.status,
      final_price: result.finalPrice,
      counter_offer: result.counterOffer,
      reasoning: result.reasoning,
    };

    const latency_ms = Date.now() - start;

    // --- Audit log (fire-and-forget) ---
    logAuditEvent({
      merchant_id: merchant.id,
      session_id: session_id ?? undefined,
      event_type: AuditEventType.NEGOTIATION_STEP,
      event_data: {
        product_id,
        product_price: product.price,
        proposed_price,
        quantity,
        result_status: result.status,
        final_price: result.finalPrice,
        counter_offer: result.counterOffer,
        floor_price: result.floorPrice,
      },
      ai_involved: false,
      decision_reasoning: `Deterministic negotiation: ${result.reasoning}`,
      latency_ms,
    }).catch(() => {});

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const latency_ms = Date.now() - start;

    if (error instanceof ArovaError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Negotiate] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
