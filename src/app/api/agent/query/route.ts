import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { validateAgentQuery } from '@/lib/engine/validators';
import { validateMerchantSlug } from '@/lib/engine/validators';
import { semanticSearch } from '@/lib/ai/semantic-search';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { CatalogProduct } from '@/types/catalog';
import type { AgentQueryResponse } from '@/types/agent-protocol';

// ---------------------------------------------------------------------------
// POST /api/agent/query
//
// Accepts a natural-language product query from a buyer agent. First attempts
// deterministic keyword matching; falls back to Gemini-powered semantic search
// when no exact matches are found. The response includes which method was used
// so the caller (and audit log) knows whether AI was involved.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    // --- Parse & validate body ---
    const body = await request.json();
    const validation = validateAgentQuery(body);

    if (!validation.success) {
      throw new ValidationError(`Invalid query request: ${validation.errors.join('; ')}`);
    }
    const { slug, query, filters, session_id } = validation.data;

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

    // --- Fetch active products for this merchant ---
    let productQuery = supabase
      .from('catalog_products')
      .select('*')
      .eq('merchant_id', merchant.id)
      .eq('is_active', true);

    // Apply optional filters
    if (filters?.category) {
      productQuery = productQuery.eq('category', filters.category);
    }
    if (filters?.min_price !== undefined) {
      productQuery = productQuery.gte('price', filters.min_price);
    }
    if (filters?.max_price !== undefined) {
      productQuery = productQuery.lte('price', filters.max_price);
    }

    const { data: products, error: productsError } = await productQuery;

    if (productsError) {
      console.error('[Query] Failed to fetch products:', productsError.message);
      throw new ArovaError('Failed to fetch product catalog.', 500);
    }

    const catalogProducts = (products ?? []) as CatalogProduct[];

    // --- Semantic search (deterministic first, AI fallback) ---
    const searchResult = await semanticSearch(query, catalogProducts);

    const aiInvolved = searchResult.method === 'semantic_search';

    const response: AgentQueryResponse = {
      products: searchResult.results,
      count: searchResult.results.length,
      method_used: searchResult.method,
    };

    const latency_ms = Date.now() - start;

    // --- Audit log (fire-and-forget) ---
    logAuditEvent({
      merchant_id: merchant.id,
      session_id: session_id ?? undefined,
      event_type: AuditEventType.QUERY,
      event_data: {
        query,
        filters: filters ?? null,
        results_count: searchResult.results.length,
        method: searchResult.method,
      },
      ai_involved: aiInvolved,
      ai_model: aiInvolved ? 'gemini-flash' : undefined,
      ai_input_summary: aiInvolved ? `Query: "${query}"` : undefined,
      ai_output_summary: aiInvolved
        ? `Found ${searchResult.results.length} products via semantic search`
        : undefined,
      decision_reasoning: aiInvolved
        ? 'No deterministic matches found; fell back to AI semantic search.'
        : 'Deterministic keyword matching returned results.',
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
    console.error('[Query] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
