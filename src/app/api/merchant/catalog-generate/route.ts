import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import { DEFAULT_MERCHANT_SLUG } from '@/lib/utils/constants';
import { generateSemanticCatalog } from '@/lib/ai/catalog-generator';

// ---------------------------------------------------------------------------
// POST /api/merchant/catalog-generate
//
// Accepts { product_id } in the body, fetches the product from Supabase,
// calls Gemini to generate a semantic description + attributes + JSON-LD,
// updates the product row, and logs an audit event with ai_involved=true.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const { product_id } = body;

    if (!product_id || typeof product_id !== 'string') {
      throw new ValidationError('Missing or invalid "product_id" in request body.');
    }

    const supabase = getServerSupabase();

    // --- Resolve default merchant ---
    const { data: merchant, error: merchantErr } = await supabase
      .from('merchants')
      .select('id')
      .eq('agent_endpoint_slug', DEFAULT_MERCHANT_SLUG)
      .single();

    if (merchantErr || !merchant) {
      throw new NotFoundError(`Default merchant "${DEFAULT_MERCHANT_SLUG}" not found.`);
    }

    const merchantId = merchant.id as string;

    // --- Fetch the product ---
    const { data: product, error: productErr } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('id', product_id)
      .eq('merchant_id', merchantId)
      .single();

    if (productErr || !product) {
      throw new NotFoundError(`Product "${product_id}" not found.`);
    }

    // --- Call Gemini for semantic catalog generation ---
    const aiResult = await generateSemanticCatalog({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });

    // --- Update product in Supabase ---
    const { data: updated, error: updateErr } = await supabase
      .from('catalog_products')
      .update({
        semantic_description: aiResult.semantic_description,
        attributes: aiResult.attributes,
        json_ld: aiResult.json_ld,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)
      .eq('merchant_id', merchantId)
      .select('*')
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to update product: ${updateErr?.message ?? 'unknown error'}`);
    }

    const latencyMs = Date.now() - start;

    // --- Audit log ---
    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.CATALOG_GENERATED,
      event_data: {
        product_id,
        product_name: product.name,
        generated_fields: ['semantic_description', 'attributes', 'json_ld'],
      },
      ai_involved: true,
      ai_model: 'gemini-2.0-flash',
      ai_input_summary: `Product: ${product.name} — ${product.description}`,
      ai_output_summary: aiResult.semantic_description.slice(0, 256),
      decision_reasoning: 'AI-generated semantic catalog for improved agent discoverability.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ product: updated }, { status: 200 });
  } catch (error) {
    const latencyMs = Date.now() - start;

    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CatalogGenerate] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
