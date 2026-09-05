import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import { DEFAULT_MERCHANT_SLUG } from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// GET / POST / PUT / DELETE  /api/merchant/rules
//
// CRUD operations on the commerce_rules table for the default merchant.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Zod schemas for rule inputs
// ---------------------------------------------------------------------------

const CreateRuleSchema = z.object({
  rule_text: z.string().min(1).max(4096),
  rule_type: z.string().min(1).max(128),
  priority: z.number().int().nonnegative().optional().default(1),
});

const UpdateRuleSchema = z.object({
  rule_text: z.string().min(1).max(4096).optional(),
  rule_type: z.string().min(1).max(128).optional(),
  priority: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

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
    throw new NotFoundError(`Default merchant "${DEFAULT_MERCHANT_SLUG}" not found.`);
  }
  return data.id as string;
}

// ---------------------------------------------------------------------------
// GET — list all rules for the default merchant
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  try {
    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: rules, error } = await supabase
      .from('commerce_rules')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('priority', { ascending: true });

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return NextResponse.json({ rules: rules ?? [], count: rules?.length ?? 0 }, { status: 200 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Rules GET] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new rule
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const parsed = CreateRuleSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join('; ')}`);
    }

    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: rule, error } = await supabase
      .from('commerce_rules')
      .insert({
        merchant_id: merchantId,
        rule_text: parsed.data.rule_text,
        rule_type: parsed.data.rule_type,
        priority: parsed.data.priority,
        is_active: true,
        compiled_rule: null,
        test_results: null,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    const latencyMs = Date.now() - start;

    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.RULE_COMPILED,
      event_data: { action: 'create', rule_id: rule.id, rule_type: parsed.data.rule_type },
      ai_involved: false,
      decision_reasoning: 'Commerce rule created via merchant dashboard.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Rules POST] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT — update an existing rule
// ---------------------------------------------------------------------------

export async function PUT(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('Missing or invalid rule "id" in request body.');
    }

    const parsed = UpdateRuleSchema.safeParse(fields);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join('; ')}`);
    }

    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: rule, error } = await supabase
      .from('commerce_rules')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .select('*')
      .single();

    if (error || !rule) {
      throw new NotFoundError(`Rule "${id}" not found or update failed.`);
    }

    const latencyMs = Date.now() - start;

    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.RULE_COMPILED,
      event_data: { action: 'update', rule_id: id, updated_fields: Object.keys(parsed.data) },
      ai_involved: false,
      decision_reasoning: 'Commerce rule updated via merchant dashboard.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ rule }, { status: 200 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Rules PUT] Unhandled error:', message);
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
      throw new ValidationError('Missing or invalid rule "id" in request body.');
    }

    const merchantId = await getDefaultMerchantId();
    const supabase = getServerSupabase();

    const { data: rule, error } = await supabase
      .from('commerce_rules')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .select('id, is_active')
      .single();

    if (error || !rule) {
      throw new NotFoundError(`Rule "${id}" not found.`);
    }

    const latencyMs = Date.now() - start;

    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.RULE_COMPILED,
      event_data: { action: 'soft_delete', rule_id: id },
      ai_involved: false,
      decision_reasoning: 'Commerce rule soft-deleted via merchant dashboard.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json({ success: true, rule }, { status: 200 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Rules DELETE] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
