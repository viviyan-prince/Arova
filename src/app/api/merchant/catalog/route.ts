import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import { DEFAULT_MERCHANT_SLUG } from '@/lib/utils/constants';
import {
  CreateProductInputSchema,
  UpdateProductInputSchema,
} from '@/types/catalog';

// ---------------------------------------------------------------------------
// GET / POST / PUT / DELETE  /api/merchant/catalog
//
// CRUD operations on the catalog_products table for the default merchant.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Helper: resolve default merchant id
// ---------------------------------------------------------------------------

async function getDefaultMerchantId(): Promise<string> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('merchants')
    .select('id')
    .eq('agent_endpoint_slug', DEFAULT_MERCHANT_SLUG)
    .single();

  if (error || !data) {
    throw new NotFoundError(
      `Default merchant "${DEFAULT_MERCHANT_SLUG}" not found.`,
    );
  }
  return data.id as string;
}

// ---------------------------------------------------------------------------
// GET — list all products for the default merchant
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  const start = Date.now();

  try {
    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: products, error } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return NextResponse.json({ products: products ?? [], count: products?.length ?? 0 }, { status: 200 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Catalog GET] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new product
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const merchantId = await getDefaultMerchantId();

    // Inject the default merchant_id if not provided
    const input = { ...body, merchant_id: body.merchant_id ?? merchantId };
    const parsed = CreateProductInputSchema.safeParse(input);

    if (!parsed.success) {
      const errors = parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join('; ')}`);
    }

    const supabase = getServerSupabase();

    const { data: product, error } = await supabase
      .from('catalog_products')
      .insert(parsed.data)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    const latencyMs = Date.now() - start;

    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.CATALOG_GENERATED,
      event_data: { action: 'create', product_id: product.id },
      ai_involved: false,
      decision_reasoning: 'Product created via merchant dashboard.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Catalog POST] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT — update an existing product
// ---------------------------------------------------------------------------

export async function PUT(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('Missing or invalid product "id" in request body.');
    }

    const parsed = UpdateProductInputSchema.safeParse(fields);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join('; ')}`);
    }

    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: product, error } = await supabase
      .from('catalog_products')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .select('*')
      .single();

    if (error || !product) {
      throw new NotFoundError(`Product "${id}" not found or update failed.`);
    }

    const latencyMs = Date.now() - start;

    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.CATALOG_GENERATED,
      event_data: { action: 'update', product_id: id, updated_fields: Object.keys(parsed.data) },
      ai_involved: false,
      decision_reasoning: 'Product updated via merchant dashboard.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Catalog PUT] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — soft-delete (set is_active = false)
// ---------------------------------------------------------------------------

export async function DELETE(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('Missing or invalid product "id" in request body.');
    }

    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: product, error } = await supabase
      .from('catalog_products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .select('id, is_active')
      .single();

    if (error || !product) {
      throw new NotFoundError(`Product "${id}" not found.`);
    }

    const latencyMs = Date.now() - start;

    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.CATALOG_GENERATED,
      event_data: { action: 'soft_delete', product_id: id },
      ai_involved: false,
      decision_reasoning: 'Product soft-deleted via merchant dashboard.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Catalog DELETE] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
