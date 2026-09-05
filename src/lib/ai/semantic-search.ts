import { callGemini } from '@/lib/ai/gemini';
import type { CatalogProduct } from '@/types/catalog';

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface SemanticSearchResult {
  results: CatalogProduct[];
  method: 'exact_match' | 'semantic_search';
}

// ---------------------------------------------------------------------------
// Stage 1: Deterministic matching
// ---------------------------------------------------------------------------

function deterministicSearch(
  query: string,
  products: CatalogProduct[]
): CatalogProduct[] {
  const q = query.toLowerCase().trim();
  const queryWords = q
    .split(/\s+/)
    .filter((w) => w.length > 1);

  // Score each product
  const scored = products
    .filter((p) => p.is_active)
    .map((p) => {
      let score = 0;
      const pName = p.name.toLowerCase();
      const pDesc = p.description.toLowerCase();
      const pCat = p.category.toLowerCase();
      const pSemantic = (p.semantic_description ?? '').toLowerCase();

      // Exact name match (highest weight)
      if (pName === q) {
        score += 100;
      } else if (pName.includes(q)) {
        score += 60;
      }

      // Category match
      if (pCat === q || pCat.includes(q)) {
        score += 40;
      }

      // Keyword matches across all text fields
      for (const word of queryWords) {
        if (pName.includes(word)) score += 15;
        if (pCat.includes(word)) score += 10;
        if (pDesc.includes(word)) score += 5;
        if (pSemantic.includes(word)) score += 5;
      }

      // Attribute value matches
      if (p.attributes) {
        const attrValues = Object.values(p.attributes)
          .map((v) => String(v).toLowerCase());
        for (const word of queryWords) {
          if (attrValues.some((av) => av.includes(word))) {
            score += 8;
          }
        }
      }

      return { product: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.product);
}

// ---------------------------------------------------------------------------
// Stage 2: AI-powered semantic search (Gemini fallback)
// ---------------------------------------------------------------------------

const SEARCH_SYSTEM_PROMPT = `You are a product search AI. Given a buyer's search query and a product catalog, return the top 3 most relevant products ranked by relevance.

Return ONLY valid JSON with this structure:
{ "matches": [{ "product_id": "<id>", "relevance_score": <0-1>, "reasoning": "<why this matches>" }] }

No markdown, no code fences, no extra text. If nothing matches, return { "matches": [] }.`;

interface GeminiMatchResult {
  matches: Array<{
    product_id: string;
    relevance_score: number;
    reasoning: string;
  }>;
}

async function aiSemanticSearch(
  query: string,
  products: CatalogProduct[]
): Promise<CatalogProduct[]> {
  // Build a compact catalog summary for the prompt
  const catalogSummary = products
    .filter((p) => p.is_active)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      semantic_description: p.semantic_description,
      price: p.price,
      category: p.category,
      attributes: p.attributes,
    }));

  const userPrompt = `Search query: "${query}"

Product catalog:
${JSON.stringify(catalogSummary, null, 2)}

Return the top 3 most relevant product IDs ranked by relevance.`;

  const raw = await callGemini(userPrompt, SEARCH_SYSTEM_PROMPT);

  // Parse the response
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed: GeminiMatchResult = JSON.parse(cleaned);

  if (!parsed.matches || !Array.isArray(parsed.matches)) {
    return [];
  }

  // Look up full product objects, maintaining relevance order
  const productMap = new Map(products.map((p) => [p.id, p]));
  return parsed.matches
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .map((m) => productMap.get(m.product_id))
    .filter((p): p is CatalogProduct => p !== undefined);
}

// ---------------------------------------------------------------------------
// Fallback: basic keyword matching when AI also fails
// ---------------------------------------------------------------------------

function basicKeywordFallback(
  query: string,
  products: CatalogProduct[]
): CatalogProduct[] {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return [];

  return products
    .filter((p) => p.is_active)
    .filter((p) => {
      const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      return words.some((w) => text.includes(w));
    })
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function semanticSearch(
  query: string,
  products: CatalogProduct[]
): Promise<SemanticSearchResult> {
  const startMs = Date.now();

  if (!query.trim() || products.length === 0) {
    return { results: [], method: 'exact_match' };
  }

  // --- Stage 1: Deterministic ---
  const deterministicResults = deterministicSearch(query, products);

  if (deterministicResults.length > 0) {
    const latencyMs = Date.now() - startMs;
    console.log(
      `[SemanticSearch] Deterministic match found ${deterministicResults.length} results in ${latencyMs}ms`
    );
    return {
      results: deterministicResults.slice(0, 10),
      method: 'exact_match',
    };
  }

  // --- Stage 2: AI Semantic Search ---
  try {
    const aiResults = await aiSemanticSearch(query, products);

    const latencyMs = Date.now() - startMs;
    console.log(
      `[SemanticSearch] AI semantic search found ${aiResults.length} results in ${latencyMs}ms`
    );

    if (aiResults.length > 0) {
      return {
        results: aiResults,
        method: 'semantic_search',
      };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[SemanticSearch] AI search failed: ${msg}. Falling back to keywords.`);
  }

  // --- Fallback: basic keyword matching ---
  const fallbackResults = basicKeywordFallback(query, products);
  const latencyMs = Date.now() - startMs;
  console.log(
    `[SemanticSearch] Keyword fallback found ${fallbackResults.length} results in ${latencyMs}ms`
  );

  return {
    results: fallbackResults,
    method: 'exact_match',
  };
}
