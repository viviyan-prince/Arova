import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { ArovaError } from '@/lib/utils/errors';

// ---------------------------------------------------------------------------
// GET /api/audit?merchant_id=...&session_id=...&event_type=...&ai_involved=...&limit=...&offset=...
//
// Queries the audit_log table with optional filters and returns paginated
// results ordered by created_at descending.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const merchantId = searchParams.get('merchant_id');
    const sessionId = searchParams.get('session_id');
    const eventType = searchParams.get('event_type');
    const aiInvolvedParam = searchParams.get('ai_involved');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 200);
    const offset = Math.max(parseInt(offsetParam ?? '0', 10) || 0, 0);

    const supabase = getServerSupabase();

    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // --- Apply optional filters ---
    if (merchantId) {
      query = query.eq('merchant_id', merchantId);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (aiInvolvedParam !== null) {
      const aiInvolved = aiInvolvedParam === 'true';
      query = query.eq('ai_involved', aiInvolved);
    }

    const { data: events, error, count } = await query;

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return NextResponse.json(
      {
        events: events ?? [],
        count: events?.length ?? 0,
        total: count ?? 0,
        limit,
        offset,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Audit GET] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
