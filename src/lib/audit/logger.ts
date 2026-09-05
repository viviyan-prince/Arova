import { getServerSupabase } from '@/lib/supabase/server';
import type { AuditEvent } from '@/lib/audit/types';

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const supabase = getServerSupabase();

  const { error } = await supabase.from('audit_log').insert({
    merchant_id: event.merchant_id,
    session_id: event.session_id ?? null,
    transaction_id: event.transaction_id ?? null,
    event_type: event.event_type,
    event_data: event.event_data,
    ai_involved: event.ai_involved,
    ai_model: event.ai_model ?? null,
    ai_input_summary: event.ai_input_summary ?? null,
    ai_output_summary: event.ai_output_summary ?? null,
    decision_reasoning: event.decision_reasoning,
    latency_ms: event.latency_ms,
  });

  if (error) {
    console.error('[Arova Audit] Failed to write audit log:', error.message, {
      event_type: event.event_type,
      merchant_id: event.merchant_id,
    });
  }
}
