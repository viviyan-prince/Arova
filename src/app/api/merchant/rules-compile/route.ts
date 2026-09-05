import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import { DEFAULT_MERCHANT_SLUG } from '@/lib/utils/constants';
import { compileRule } from '@/lib/ai/rule-compiler';

// ---------------------------------------------------------------------------
// POST /api/merchant/rules-compile
//
// Accepts { rule_id } in the body, fetches the rule from Supabase,
// calls Gemini to compile the natural-language rule into a structured rule,
// updates the rule row with compiled_rule and test_results, and logs an
// audit event with ai_involved=true.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const body = await request.json();
    const { rule_id } = body;

    if (!rule_id || typeof rule_id !== 'string') {
      throw new ValidationError('Missing or invalid "rule_id" in request body.');
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

    // --- Fetch the rule ---
    const { data: rule, error: ruleErr } = await supabase
      .from('commerce_rules')
      .select('*')
      .eq('id', rule_id)
      .eq('merchant_id', merchantId)
      .single();

    if (ruleErr || !rule) {
      throw new NotFoundError(`Rule "${rule_id}" not found.`);
    }

    // --- Call Gemini to compile the rule ---
    const { compiled_rule, test_results } = await compileRule(
      rule.rule_text,
      rule.rule_type,
    );

    // --- Update rule in Supabase ---
    const { data: updated, error: updateErr } = await supabase
      .from('commerce_rules')
      .update({
        compiled_rule,
        test_results,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rule_id)
      .eq('merchant_id', merchantId)
      .select('*')
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to update rule: ${updateErr?.message ?? 'unknown error'}`);
    }

    const latencyMs = Date.now() - start;

    // --- Audit log ---
    logAuditEvent({
      merchant_id: merchantId,
      event_type: AuditEventType.RULE_COMPILED,
      event_data: {
        rule_id,
        rule_text: rule.rule_text,
        rule_type: rule.rule_type,
        compiled_rule_type: compiled_rule.type,
        tests_passed: test_results.filter(
          (t: { expected: boolean; actual: boolean }) => t.expected === t.actual,
        ).length,
        tests_total: test_results.length,
      },
      ai_involved: true,
      ai_model: 'gemini-2.0-flash',
      ai_input_summary: `Rule: "${rule.rule_text}" (type: ${rule.rule_type})`,
      ai_output_summary: `Compiled to ${compiled_rule.type} rule, ${compiled_rule.condition.operator} on ${compiled_rule.condition.field}`,
      decision_reasoning: 'AI compiled natural-language rule into deterministic structured rule.',
      latency_ms: latencyMs,
    }).catch(() => {});

    return NextResponse.json(
      {
        rule: updated,
        compiled_rule,
        test_results,
      },
      { status: 200 },
    );
  } catch (error) {
    const latencyMs = Date.now() - start;

    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[RulesCompile] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
