import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { validateMerchantSlug } from '@/lib/engine/validators';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { MerchantCapabilities } from '@/types/merchant';

// ---------------------------------------------------------------------------
// GET /api/agent/discover?slug=<merchant-slug>
//
// Returns the merchant's capabilities, supported categories, payment methods,
// and protocol endpoints. This is the first call a buyer agent makes to
// understand what a merchant storefront offers.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const slugParam = searchParams.get('slug');

    // --- Validate slug ---
    const slugResult = validateMerchantSlug(slugParam);
    if (!slugResult.success) {
      throw new ValidationError(slugResult.error);
    }
    const slug = slugResult.slug;

    const supabase = getServerSupabase();

    // --- Fetch merchant ---
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, business_type, agent_endpoint_slug, settings')
      .eq('agent_endpoint_slug', slug)
      .single();

    if (merchantError || !merchant) {
      throw new NotFoundError(`Merchant with slug "${slug}" not found.`);
    }

    // --- Fetch distinct product categories ---
    const { data: categoryRows, error: categoryError } = await supabase
      .from('catalog_products')
      .select('category')
      .eq('merchant_id', merchant.id)
      .eq('is_active', true);

    if (categoryError) {
      console.error('[Discover] Failed to fetch categories:', categoryError.message);
    }

    const categories: string[] = categoryRows
      ? [...new Set(categoryRows.map((r: { category: string }) => r.category))].filter(Boolean)
      : [];

    // --- Build capabilities response ---
    const baseUrl = new URL(request.url).origin;

    const capabilities: MerchantCapabilities = {
      merchant: {
        name: merchant.name,
        slug: merchant.agent_endpoint_slug,
        business_type: merchant.business_type,
      },
      protocol_version: '1.0',
      capabilities: ['discover', 'query', 'negotiate', 'checkout', 'status'],
      categories,
      payment_methods: ['razorpay', 'upi', 'card', 'netbanking', 'wallet'],
      currency: 'INR',
      endpoints: {
        discover: `${baseUrl}/api/agent/discover?slug=${slug}`,
        query: `${baseUrl}/api/agent/query`,
        negotiate: `${baseUrl}/api/agent/negotiate`,
        checkout: `${baseUrl}/api/agent/checkout`,
        status: `${baseUrl}/api/agent/status`,
      },
    };

    const latency_ms = Date.now() - start;

    // --- Audit log (fire-and-forget) ---
    logAuditEvent({
      merchant_id: merchant.id,
      event_type: AuditEventType.DISCOVERY,
      event_data: { slug, categories_count: categories.length },
      ai_involved: false,
      decision_reasoning: 'Deterministic discovery endpoint returning merchant capabilities.',
      latency_ms,
    }).catch(() => {});

    return NextResponse.json(capabilities, { status: 200 });
  } catch (error) {
    const latency_ms = Date.now() - start;

    if (error instanceof ArovaError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Discover] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
