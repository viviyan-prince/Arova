import { z } from 'zod';
import { callGemini } from '@/lib/ai/gemini';
import { generateProductJsonLd } from '@/lib/utils/schema-org';
import { AIServiceError } from '@/lib/utils/errors';

// ---------------------------------------------------------------------------
// Zod schema for the expected Gemini response
// ---------------------------------------------------------------------------

const CatalogGenerationResultSchema = z.object({
  semantic_description: z.string().min(1),
  attributes: z.record(z.string(), z.any()),
  json_ld: z.any(),
});

type CatalogGenerationResult = z.infer<typeof CatalogGenerationResultSchema>;

// ---------------------------------------------------------------------------
// Few-shot examples embedded in the prompt
// ---------------------------------------------------------------------------

const FEW_SHOT_EXAMPLES = `
Example 1:
Input: { "name": "Nike Air Max 270", "description": "Men's running shoes with Air Max cushioning, black/white colorway, sizes 7-12", "price": 12999, "category": "Footwear" }
Output: {
  "semantic_description": "Premium men's running shoes from Nike featuring signature Air Max 270 cushioning technology for maximum comfort during runs and daily wear. Available in a classic black and white colorway across sizes 7 through 12, ideal for athletic training or casual streetwear.",
  "attributes": { "brand": "Nike", "size_range": "7-12", "color": "black/white", "material": "synthetic mesh", "gender": "men", "occasion": "running/casual", "cushioning": "Air Max" },
  "json_ld": { "@context": "https://schema.org", "@type": "Product", "name": "Nike Air Max 270", "description": "Men's running shoes with Air Max cushioning, black/white colorway, sizes 7-12", "category": "Footwear", "offers": { "@type": "Offer", "price": 12999, "priceCurrency": "INR", "availability": "https://schema.org/InStock" } }
}

Example 2:
Input: { "name": "Organic Cotton T-Shirt", "description": "Unisex round-neck tee, 100% organic cotton, available in S/M/L/XL, navy blue", "price": 899, "category": "Apparel" }
Output: {
  "semantic_description": "Eco-friendly unisex round-neck t-shirt crafted from 100% certified organic cotton for breathable all-day comfort. Available in navy blue across four sizes (S, M, L, XL), suitable for casual everyday wear by any gender.",
  "attributes": { "material": "organic cotton", "color": "navy blue", "size_range": "S/M/L/XL", "gender": "unisex", "neckline": "round-neck", "occasion": "casual", "eco_friendly": true },
  "json_ld": { "@context": "https://schema.org", "@type": "Product", "name": "Organic Cotton T-Shirt", "description": "Unisex round-neck tee, 100% organic cotton, available in S/M/L/XL, navy blue", "category": "Apparel", "offers": { "@type": "Offer", "price": 899, "priceCurrency": "INR", "availability": "https://schema.org/InStock" } }
}
`.trim();

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a product catalog AI. Given raw product data, generate:
1) A semantic description optimized for AI agent search (2-3 sentences). It should be rich in keywords and context to help an AI agent find this product when a buyer describes what they want.
2) Structured attributes extracted from the description (size, color, material, weight, gender, occasion, and any other relevant attributes).
3) Schema.org JSON-LD Product representation.

Return ONLY valid JSON with exactly three keys: "semantic_description", "attributes", "json_ld". No markdown, no code fences, no extra text.`;

// ---------------------------------------------------------------------------
// Build the user prompt from product input
// ---------------------------------------------------------------------------

function buildPrompt(product: {
  name: string;
  description: string;
  price: number;
  category?: string;
}): string {
  return `${FEW_SHOT_EXAMPLES}

Now generate for this product:
Input: ${JSON.stringify({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category ?? 'General',
  })}
Output:`;
}

// ---------------------------------------------------------------------------
// Parse the raw Gemini text into validated JSON
// ---------------------------------------------------------------------------

function parseGeminiResponse(raw: string): CatalogGenerationResult {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);
  return CatalogGenerationResultSchema.parse(parsed);
}

// ---------------------------------------------------------------------------
// Build a basic fallback when AI fails entirely
// ---------------------------------------------------------------------------

function buildFallback(product: {
  name: string;
  description: string;
  price: number;
  category?: string;
}): CatalogGenerationResult {
  const jsonLd = generateProductJsonLd({
    name: product.name,
    description: product.description,
    price: product.price,
    currency: 'INR',
    category: product.category ?? 'General',
    attributes: {},
    merchantName: 'Arova Merchant',
  });

  return {
    semantic_description: product.description,
    attributes: {},
    json_ld: jsonLd,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateSemanticCatalog(product: {
  name: string;
  description: string;
  price: number;
  category?: string;
}): Promise<{
  semantic_description: string;
  attributes: Record<string, any>;
  json_ld: any;
}> {
  const startMs = Date.now();

  // --- First attempt ---
  try {
    const prompt = buildPrompt(product);
    const raw = await callGemini(prompt, SYSTEM_PROMPT);
    const result = parseGeminiResponse(raw);

    const latencyMs = Date.now() - startMs;
    console.log(
      `[CatalogGenerator] Success on first attempt (${latencyMs}ms) for "${product.name}"`
    );
    return result;
  } catch (firstError) {
    const firstMsg =
      firstError instanceof Error ? firstError.message : String(firstError);
    console.warn(
      `[CatalogGenerator] First attempt failed for "${product.name}": ${firstMsg}`
    );

    // --- Retry with error context ---
    try {
      const retryPrompt =
        buildPrompt(product) +
        `\n\nIMPORTANT: Your previous response was invalid. Error: ${firstMsg}. Return ONLY valid JSON with keys "semantic_description", "attributes", "json_ld". No markdown fences.`;

      const rawRetry = await callGemini(retryPrompt, SYSTEM_PROMPT);
      const result = parseGeminiResponse(rawRetry);

      const latencyMs = Date.now() - startMs;
      console.log(
        `[CatalogGenerator] Success on retry (${latencyMs}ms) for "${product.name}"`
      );
      return result;
    } catch (retryError) {
      const retryMsg =
        retryError instanceof Error ? retryError.message : String(retryError);
      console.error(
        `[CatalogGenerator] Both attempts failed for "${product.name}": ${retryMsg}. Using fallback.`
      );

      const latencyMs = Date.now() - startMs;
      console.log(`[CatalogGenerator] Fallback used (${latencyMs}ms) for "${product.name}"`);
      return buildFallback(product);
    }
  }
}
