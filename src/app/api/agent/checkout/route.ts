import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { validateAgentCheckout, validateMerchantSlug } from '@/lib/engine/validators';
import { evaluateRules } from '@/lib/engine/rule-engine';
import { createOrder } from '@/lib/razorpay/orders';
import { createPaymentLink } from '@/lib/razorpay/payments';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { PAISE_MULTIPLIER } from '@/lib/utils/constants';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { CompiledRule } from '@/types/transaction';
import type { AgentCheckoutResponse } from '@/types/agent-protocol';
import type { CatalogProduct } from '@/types/catalog';

// ---------------------------------------------------------------------------
// POST /api/agent/checkout
//
// Creates a Razorpay order and payment link for the items in the cart.
// All monetary arithmetic uses integer paise -- NEVER floating point.
// AI is NEVER involved in checkout -- this is a pure deterministic + API path.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    // --- Parse & validate body ---
    const body = await request.json();
    const validation = validateAgentCheckout(body);

    if (!validation.success) {
      throw new ValidationError(
        `Invalid checkout request: ${validation.errors.join('; ')}`,
      );
    }
    const { slug, items, payment_method, session_id } = validation.data;

    // --- Validate slug ---
    const slugResult = validateMerchantSlug(slug);
    if (!slugResult.success) {
      throw new ValidationError(slugResult.error);
    }

    const supabase = getServerSupabase();

    // --- Fetch merchant ---
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name')
      .eq('agent_endpoint_slug', slug)
      .single();

    if (merchantError || !merchant) {
      throw new NotFoundError(`Merchant with slug "${slug}" not found.`);
    }

    // --- Validate all items exist and are in stock ---
    const productIds = items.map((item) => item.product_id);

    const { data: products, error: productsError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('merchant_id', merchant.id)
      .in('id', productIds);

    if (productsError) {
      throw new ArovaError('Failed to fetch products for checkout.', 500);
    }

    const productMap = new Map(
      ((products ?? []) as CatalogProduct[]).map((p) => [p.id, p]),
    );

    // Verify each item
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new NotFoundError(`Product "${item.product_id}" not found.`);
      }
      if (!product.is_active) {
        throw new ValidationError(
          `Product "${product.name}" is not currently available.`,
        );
      }
      if (product.inventory_count < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.inventory_count}.`,
        );
      }
    }

    // --- Calculate total amount in paise (integer arithmetic) ---
    let totalAmountPaise = 0;
    for (const item of items) {
      // agreed_price is in INR -- convert to paise with integer rounding
      const priceInPaise = Math.round(item.agreed_price * PAISE_MULTIPLIER);
      totalAmountPaise += priceInPaise * item.quantity;
    }

    // --- Evaluate acceptance rules ---
    const { data: rules, error: rulesError } = await supabase
      .from('commerce_rules')
      .select('*')
      .eq('merchant_id', merchant.id);

    if (rulesError) {
      console.error('[Checkout] Failed to fetch rules:', rulesError.message);
    }

    const compiledRules: CompiledRule[] = (rules ?? [])
      .filter((r: any) => r.type === 'acceptance')
      .map((r: any) => ({
        id: r.id,
        type: r.type,
        condition: r.condition,
        action: r.action,
        priority: r.priority ?? 0,
      }));

    if (compiledRules.length > 0) {
      // Convert total back to INR for rule evaluation context
      const totalAmountINR = totalAmountPaise / PAISE_MULTIPLIER;
      const ruleContext = {
        total_amount: totalAmountINR,
        item_count: items.length,
        quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      };
      const ruleResult = evaluateRules(compiledRules, ruleContext);

      if (ruleResult.action && ruleResult.action.type === 'reject') {
        const reason =
          ruleResult.action.parameters.reason ?? 'Order does not meet merchant requirements.';
        throw new ValidationError(String(reason));
      }
    }

    // --- Create Razorpay order ---
    const receipt = `arova_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const razorpayOrder = await createOrder(totalAmountPaise, receipt, {
      merchant_slug: slug,
      merchant_name: merchant.name,
      items_count: String(items.length),
    });

    // --- Create payment link ---
    const baseUrl = new URL(request.url).origin;
    const paymentLink = await createPaymentLink({
      amount: totalAmountPaise,
      currency: 'INR',
      description: `Order from ${merchant.name} via Arova`,
      referenceId: razorpayOrder.id,
      callbackUrl: `${baseUrl}/api/razorpay/callback`,
    });

    // --- Insert transaction record ---
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        session_id: session_id ?? null,
        merchant_id: merchant.id,
        razorpay_order_id: razorpayOrder.id,
        amount: totalAmountPaise,
        currency: 'INR',
        status: 'initiated',
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          agreed_price: item.agreed_price,
        })),
        negotiation_history: [],
        payment_method: payment_method ?? null,
      })
      .select('id')
      .single();

    if (txnError) {
      console.error('[Checkout] Failed to insert transaction:', txnError.message);
      throw new ArovaError('Failed to create transaction record.', 500);
    }

    const response: AgentCheckoutResponse = {
      order_id: transaction.id,
      razorpay_order_id: razorpayOrder.id,
      amount: totalAmountPaise,
      currency: 'INR',
      payment_link_url: paymentLink.short_url,
    };

    const latency_ms = Date.now() - start;

    // --- Audit log (fire-and-forget) ---
    logAuditEvent({
      merchant_id: merchant.id,
      session_id: session_id ?? undefined,
      transaction_id: transaction.id,
      event_type: AuditEventType.CHECKOUT,
      event_data: {
        order_id: transaction.id,
        razorpay_order_id: razorpayOrder.id,
        amount_paise: totalAmountPaise,
        items_count: items.length,
        total_quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      },
      ai_involved: false,
      decision_reasoning:
        'Deterministic checkout: validated items, computed total in paise, created Razorpay order and payment link.',
      latency_ms,
    }).catch(() => {});

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const latency_ms = Date.now() - start;

    if (error instanceof ArovaError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Checkout] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
