#!/usr/bin/env npx tsx
/**
 * generate-synthetic-data.ts
 *
 * Generates seed data for the Arova demo merchant "SportKart India".
 *
 * Usage:
 *   npx tsx scripts/generate-synthetic-data.ts              # prints SQL to stdout
 *   npx tsx scripts/generate-synthetic-data.ts --json       # writes seed-data.json
 *   npx tsx scripts/generate-synthetic-data.ts --sql        # prints SQL only (default)
 *   npx tsx scripts/generate-synthetic-data.ts --both       # SQL to stdout + JSON file
 */

import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const wantJson = args.includes('--json') || args.includes('--both');
const wantSql = args.includes('--sql') || args.includes('--both') || !args.includes('--json');

// ---------------------------------------------------------------------------
// IDs (deterministic UUIDs so re-runs are idempotent)
// ---------------------------------------------------------------------------

const MERCHANT_ID = '00000000-0000-4000-a000-000000000001';

function productId(index: number): string {
  const hex = index.toString(16).padStart(12, '0');
  return `00000000-0000-4000-b000-${hex}`;
}

function ruleId(index: number): string {
  const hex = index.toString(16).padStart(12, '0');
  return `00000000-0000-4000-c000-${hex}`;
}

// ---------------------------------------------------------------------------
// Merchant
// ---------------------------------------------------------------------------

const merchant = {
  id: MERCHANT_ID,
  name: 'SportKart India',
  razorpay_key_id: 'rzp_test_REPLACE_ME',
  razorpay_key_secret: 'REPLACE_ME_SECRET',
  business_type: 'D2C Sports & Fitness',
  agent_endpoint_slug: 'sportkart',
  settings: {
    currency: 'INR',
    negotiation_enabled: true,
    max_discount_pct: 15,
    free_shipping_threshold: 1500,
    return_window_days: 7,
  },
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

interface ProductSeed {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  semantic_description: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string;
  attributes: {
    sizes: string[];
    colors: string[];
    material?: string;
    weight_grams?: number;
  };
  inventory_count: number;
  is_active: boolean;
  json_ld: Record<string, any>;
}

function schemaOrgProduct(p: Omit<ProductSeed, 'json_ld'>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    sku: p.id,
    brand: { '@type': 'Brand', name: 'SportKart India' },
    category: `${p.category} > ${p.subcategory}`,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: p.currency,
      availability: p.inventory_count > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

const rawProducts: Omit<ProductSeed, 'id' | 'merchant_id' | 'currency' | 'is_active' | 'json_ld'>[] = [
  // --- Footwear ---
  {
    name: 'TrailRunner Pro',
    description:
      'Engineered for Indian trails from Sahyadris to Himalayan foothills. Reinforced toe cap, Vibram-inspired grip sole, and breathable mesh upper keep your feet cool on steep inclines. Ideal for weekend treks and trail running in varied monsoon conditions.',
    semantic_description:
      'trail running shoe, hiking, outdoor, waterproof, grip sole, trekking, sports footwear, men, women, unisex, monsoon-ready',
    price: 1299,
    category: 'Footwear',
    subcategory: 'Trail Running',
    attributes: {
      sizes: ['UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11'],
      colors: ['Charcoal Black', 'Forest Green', 'Slate Blue'],
      material: 'Breathable mesh upper, EVA midsole',
      weight_grams: 340,
    },
    inventory_count: 35,
  },
  {
    name: 'UrbanWalk Lite',
    description:
      'Lightweight everyday walking shoe designed for Indian city commutes. Memory foam insole absorbs pavement shock while the knit upper flexes naturally with each step. Pairs well with casuals and smart-casual office wear.',
    semantic_description:
      'walking shoe, casual, everyday, lightweight, memory foam, city commute, office, knit upper',
    price: 899,
    category: 'Footwear',
    subcategory: 'Walking',
    attributes: {
      sizes: ['UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
      colors: ['White/Grey', 'Navy Blue', 'All Black'],
      material: 'Knit fabric upper, memory foam insole',
      weight_grams: 260,
    },
    inventory_count: 42,
  },
  {
    name: 'SprintMax',
    description:
      'Competition-grade sprinting shoe with a carbon-fibre reinforced plate for explosive push-off. Ultralight construction at 190g and a seamless inner sleeve eliminate friction during high-cadence running. Made for track days and speed training.',
    semantic_description:
      'sprinting shoe, carbon plate, racing, competition, track, lightweight, speed training, athletics',
    price: 1899,
    category: 'Footwear',
    subcategory: 'Running',
    attributes: {
      sizes: ['UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
      colors: ['Neon Yellow', 'Racing Red', 'Electric Blue'],
      material: 'Carbon-fibre plate, TPU cage, engineered mesh',
      weight_grams: 190,
    },
    inventory_count: 18,
  },
  {
    name: 'CasualStep',
    description:
      'Affordable slip-on sneaker for college students and weekend errands. Canvas upper with vulcanized rubber sole gives that classic silhouette at a price that does not hurt. Available in earthy tones that go with everything.',
    semantic_description:
      'casual sneaker, slip-on, canvas, affordable, college, everyday, budget-friendly, unisex',
    price: 599,
    category: 'Footwear',
    subcategory: 'Casual',
    attributes: {
      sizes: ['UK5', 'UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
      colors: ['Olive Green', 'Sand Beige', 'Washed Denim'],
      material: 'Canvas upper, vulcanized rubber sole',
      weight_grams: 300,
    },
    inventory_count: 50,
  },
  {
    name: 'AllTerrain Boot',
    description:
      'Ankle-height adventure boot built for Ladakh jeep trails and Coorg plantation walks. Full-grain leather with waterproof membrane keeps water out. Steel shank provides arch support on uneven ground. Resoleable Vibram outsole rated for 1000km.',
    semantic_description:
      'hiking boot, adventure, waterproof, leather, ankle support, Ladakh, trekking, heavy-duty, outdoor',
    price: 2499,
    category: 'Footwear',
    subcategory: 'Hiking',
    attributes: {
      sizes: ['UK7', 'UK8', 'UK9', 'UK10', 'UK11'],
      colors: ['Tan Brown', 'Midnight Black'],
      material: 'Full-grain leather, waterproof membrane, Vibram outsole',
      weight_grams: 680,
    },
    inventory_count: 12,
  },

  // --- Apparel ---
  {
    name: 'DryFit Tee',
    description:
      'Moisture-wicking polyester tee designed for the Indian gym-goer. Four-way stretch fabric moves with you during deadlifts and burpees. Flatlock seams prevent chafing on long cardio sessions. Anti-odour treatment lasts 30 washes.',
    semantic_description:
      'gym t-shirt, moisture wicking, dryfit, workout, training, anti-odour, sports apparel, men, women',
    price: 499,
    category: 'Apparel',
    subcategory: 'T-Shirts',
    attributes: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Jet Black', 'Arctic White', 'Deep Teal', 'Crimson Red'],
      material: '100% recycled polyester, 150 GSM',
    },
    inventory_count: 48,
  },
  {
    name: 'FlexFit Shorts',
    description:
      'Gym shorts with built-in compression liner for extra support. Zippered back pocket secures your phone during box jumps. Quick-dry fabric is ready for a second session the same day. 7-inch inseam hits the sweet spot for squats.',
    semantic_description:
      'gym shorts, training, compression liner, quick-dry, sports shorts, workout, men',
    price: 699,
    category: 'Apparel',
    subcategory: 'Shorts',
    attributes: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black/Grey', 'Navy/White', 'Charcoal'],
      material: '87% polyester, 13% spandex',
    },
    inventory_count: 38,
  },
  {
    name: 'WindBreaker Jacket',
    description:
      'Packable wind-resistant jacket that folds into its own chest pocket. Water-repellent DWR coating handles light drizzle during early morning runs. Reflective logos on front and back keep you visible in pre-dawn traffic. Weighs under 200g.',
    semantic_description:
      'windbreaker, running jacket, packable, water-repellent, reflective, lightweight, morning run, outdoor',
    price: 1499,
    category: 'Apparel',
    subcategory: 'Jackets',
    attributes: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Neon Green', 'Storm Grey', 'Electric Orange'],
      material: 'Ripstop nylon, DWR coating',
      weight_grams: 195,
    },
    inventory_count: 22,
  },
  {
    name: 'ComfortPolo',
    description:
      'Performance polo that transitions from the badminton court to a casual Friday meeting. Pique knit fabric with stretch panels under the arms lets you smash without restriction. Collar stays crisp wash after wash.',
    semantic_description:
      'polo t-shirt, sports polo, badminton, office casual, performance fabric, men',
    price: 799,
    category: 'Apparel',
    subcategory: 'Polos',
    attributes: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Royal Blue', 'Classic White', 'Bottle Green', 'Burgundy'],
      material: 'Cotton-polyester pique, 220 GSM',
    },
    inventory_count: 30,
  },
  {
    name: 'TrackPants Pro',
    description:
      'Tapered jogger-fit track pants with zipper ankles so they slip over training shoes. Brushed fleece interior keeps you warm during winter outdoor sessions in Delhi or Bangalore mornings. Deep side pockets hold phone and keys securely.',
    semantic_description:
      'track pants, joggers, training pants, winter, fleece-lined, tapered, sports, men, women',
    price: 999,
    category: 'Apparel',
    subcategory: 'Track Pants',
    attributes: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Dark Grey Melange', 'Navy Blue'],
      material: '60% cotton, 40% polyester, brushed fleece interior',
    },
    inventory_count: 26,
  },

  // --- Accessories ---
  {
    name: 'SportGrip Socks',
    description:
      'Ankle-length performance socks with silicone grip dots on the sole. Arch compression band reduces fatigue during long runs. Reinforced heel and toe for durability. Pack of 3 pairs.',
    semantic_description:
      'sports socks, grip socks, running, ankle socks, compression, pack of 3, gym',
    price: 199,
    category: 'Accessories',
    subcategory: 'Socks',
    attributes: {
      sizes: ['Free Size (UK6-10)'],
      colors: ['Black (3-pack)', 'White (3-pack)', 'Assorted (3-pack)'],
      material: 'Combed cotton blend, silicone grip dots',
    },
    inventory_count: 50,
  },
  {
    name: 'SweatBand Pro',
    description:
      'Wide-format terry cotton headband that absorbs sweat before it reaches your eyes. Silicone inner strip prevents slipping during intense HIIT sessions. Machine washable and quick-drying.',
    semantic_description:
      'sweatband, headband, gym, HIIT, workout, terry cotton, absorbent, unisex',
    price: 149,
    category: 'Accessories',
    subcategory: 'Headwear',
    attributes: {
      sizes: ['Free Size'],
      colors: ['Black', 'White', 'Neon Pink', 'Sky Blue'],
      material: '80% terry cotton, 20% elastic blend',
    },
    inventory_count: 45,
  },
  {
    name: 'GymBag XL',
    description:
      'Spacious 40L duffel with separate ventilated shoe compartment and wet-pocket for post-workout gear. Padded shoulder strap distributes weight evenly. Water-resistant base protects contents on locker room floors.',
    semantic_description:
      'gym bag, duffel bag, sports bag, 40 litres, shoe compartment, water-resistant, travel',
    price: 899,
    category: 'Accessories',
    subcategory: 'Bags',
    attributes: {
      sizes: ['One Size (40L)'],
      colors: ['Black/Red', 'Grey/Lime', 'Navy/Orange'],
      material: '600D polyester, water-resistant base',
      weight_grams: 650,
    },
    inventory_count: 20,
  },
  {
    name: 'RunnerCap',
    description:
      'Lightweight running cap with laser-cut ventilation holes and a pre-curved brim. UPF 50+ fabric blocks harsh Indian summer sun. Adjustable quick-release buckle fits all head sizes. Reflective logo for evening runs.',
    semantic_description:
      'running cap, sun protection, UPF 50, ventilated, lightweight, reflective, outdoor, sports cap',
    price: 349,
    category: 'Accessories',
    subcategory: 'Headwear',
    attributes: {
      sizes: ['Free Size (adjustable)'],
      colors: ['White', 'Black', 'Neon Yellow'],
      material: 'Recycled polyester, UPF 50+',
      weight_grams: 55,
    },
    inventory_count: 34,
  },
  {
    name: 'FitBand Watch',
    description:
      'Feature-packed fitness band with heart rate, SpO2, and sleep tracking. 14-day battery life means you charge it less often than your phone. 5 ATM water resistance for swimming. Pairs via Bluetooth 5.2 with Android and iOS.',
    semantic_description:
      'fitness band, smartwatch, heart rate monitor, SpO2, sleep tracker, waterproof, bluetooth, health, wearable',
    price: 4999,
    category: 'Accessories',
    subcategory: 'Wearables',
    attributes: {
      sizes: ['Free Size (adjustable strap)'],
      colors: ['Midnight Black', 'Sage Green', 'Rose Gold'],
      material: 'Polycarbonate case, silicone strap, AMOLED display',
      weight_grams: 28,
    },
    inventory_count: 15,
  },
];

const products: ProductSeed[] = rawProducts.map((rp, i) => {
  const base = {
    id: productId(i + 1),
    merchant_id: MERCHANT_ID,
    currency: 'INR',
    is_active: true,
    ...rp,
  };
  return {
    ...base,
    json_ld: schemaOrgProduct(base),
  } as ProductSeed;
});

// ---------------------------------------------------------------------------
// Commerce Rules (plain-text originals + compiled form)
// ---------------------------------------------------------------------------

interface RuleSeed {
  id: string;
  merchant_id: string;
  rule_type: string;
  natural_language: string;
  compiled_rule: {
    id: string;
    type: string;
    condition: {
      field: string;
      operator: string;
      value: any;
    };
    action: {
      type: string;
      parameters: Record<string, any>;
    };
    priority: number;
  };
  is_active: boolean;
}

const rules: RuleSeed[] = [
  {
    id: ruleId(1),
    merchant_id: MERCHANT_ID,
    rule_type: 'pricing',
    natural_language:
      'Orders above INR 1500 get free shipping.',
    compiled_rule: {
      id: ruleId(1),
      type: 'shipping',
      condition: { field: 'order_total', operator: 'gte', value: 1500 },
      action: { type: 'modify', parameters: { shipping_cost: 0, reason: 'Free shipping on orders >= INR 1500' } },
      priority: 1,
    },
    is_active: true,
  },
  {
    id: ruleId(2),
    merchant_id: MERCHANT_ID,
    rule_type: 'negotiation',
    natural_language:
      'Maximum 10% discount allowed on any single product during negotiation.',
    compiled_rule: {
      id: ruleId(2),
      type: 'negotiation',
      condition: { field: 'requested_discount_pct', operator: 'gt', value: 10 },
      action: { type: 'reject', parameters: { max_discount_pct: 10, reason: 'Discount cannot exceed 10% per item' } },
      priority: 2,
    },
    is_active: true,
  },
  {
    id: ruleId(3),
    merchant_id: MERCHANT_ID,
    rule_type: 'pricing',
    natural_language:
      'Buy 2 or more items from the same category and get 5% off the entire order.',
    compiled_rule: {
      id: ruleId(3),
      type: 'pricing',
      condition: { field: 'same_category_item_count', operator: 'gte', value: 2 },
      action: { type: 'apply_discount', parameters: { discount_pct: 5, scope: 'order', reason: 'Multi-buy same-category discount' } },
      priority: 3,
    },
    is_active: true,
  },
  {
    id: ruleId(4),
    merchant_id: MERCHANT_ID,
    rule_type: 'acceptance',
    natural_language:
      'Reject any order where a single line item exceeds INR 10000.',
    compiled_rule: {
      id: ruleId(4),
      type: 'acceptance',
      condition: { field: 'max_line_item_total', operator: 'gt', value: 10000 },
      action: { type: 'reject', parameters: { reason: 'Single line item exceeds INR 10,000 limit' } },
      priority: 0,
    },
    is_active: true,
  },
  {
    id: ruleId(5),
    merchant_id: MERCHANT_ID,
    rule_type: 'return',
    natural_language:
      'Returns accepted within 7 days of delivery; footwear must be unworn with tags attached.',
    compiled_rule: {
      id: ruleId(5),
      type: 'return',
      condition: { field: 'days_since_delivery', operator: 'lte', value: 7 },
      action: { type: 'accept', parameters: { condition_note: 'Footwear must be unworn with tags attached', reason: '7-day return window' } },
      priority: 4,
    },
    is_active: true,
  },
];

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

function esc(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateSQL(): string {
  const lines: string[] = [];

  lines.push('-- ==========================================================');
  lines.push('-- Arova Seed Data: SportKart India');
  lines.push('-- Generated by scripts/generate-synthetic-data.ts');
  lines.push('-- ==========================================================');
  lines.push('');

  // Merchant
  lines.push('-- Merchant');
  lines.push(`INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, business_type, agent_endpoint_slug, settings, created_at, updated_at)`);
  lines.push(`VALUES (`);
  lines.push(`  ${esc(merchant.id)},`);
  lines.push(`  ${esc(merchant.name)},`);
  lines.push(`  ${esc(merchant.razorpay_key_id)},`);
  lines.push(`  ${esc(merchant.razorpay_key_secret)},`);
  lines.push(`  ${esc(merchant.business_type)},`);
  lines.push(`  ${esc(merchant.agent_endpoint_slug)},`);
  lines.push(`  ${esc(merchant.settings)},`);
  lines.push(`  NOW(),`);
  lines.push(`  NOW()`);
  lines.push(`) ON CONFLICT (id) DO UPDATE SET`);
  lines.push(`  name = EXCLUDED.name,`);
  lines.push(`  settings = EXCLUDED.settings,`);
  lines.push(`  updated_at = NOW();`);
  lines.push('');

  // Products
  lines.push('-- Products');
  for (const p of products) {
    lines.push(`INSERT INTO catalog_products (id, merchant_id, name, description, semantic_description, price, currency, category, subcategory, attributes, inventory_count, is_active, json_ld, created_at, updated_at)`);
    lines.push(`VALUES (`);
    lines.push(`  ${esc(p.id)},`);
    lines.push(`  ${esc(p.merchant_id)},`);
    lines.push(`  ${esc(p.name)},`);
    lines.push(`  ${esc(p.description)},`);
    lines.push(`  ${esc(p.semantic_description)},`);
    lines.push(`  ${esc(p.price)},`);
    lines.push(`  ${esc(p.currency)},`);
    lines.push(`  ${esc(p.category)},`);
    lines.push(`  ${esc(p.subcategory)},`);
    lines.push(`  ${esc(p.attributes)},`);
    lines.push(`  ${esc(p.inventory_count)},`);
    lines.push(`  ${esc(p.is_active)},`);
    lines.push(`  ${esc(p.json_ld)},`);
    lines.push(`  NOW(),`);
    lines.push(`  NOW()`);
    lines.push(`) ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`  name = EXCLUDED.name,`);
    lines.push(`  description = EXCLUDED.description,`);
    lines.push(`  price = EXCLUDED.price,`);
    lines.push(`  inventory_count = EXCLUDED.inventory_count,`);
    lines.push(`  attributes = EXCLUDED.attributes,`);
    lines.push(`  json_ld = EXCLUDED.json_ld,`);
    lines.push(`  updated_at = NOW();`);
    lines.push('');
  }

  // Commerce Rules
  lines.push('-- Commerce Rules');
  for (const r of rules) {
    lines.push(`INSERT INTO commerce_rules (id, merchant_id, rule_type, natural_language, compiled_rule, is_active, created_at, updated_at)`);
    lines.push(`VALUES (`);
    lines.push(`  ${esc(r.id)},`);
    lines.push(`  ${esc(r.merchant_id)},`);
    lines.push(`  ${esc(r.rule_type)},`);
    lines.push(`  ${esc(r.natural_language)},`);
    lines.push(`  ${esc(r.compiled_rule)},`);
    lines.push(`  ${esc(r.is_active)},`);
    lines.push(`  NOW(),`);
    lines.push(`  NOW()`);
    lines.push(`) ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`  natural_language = EXCLUDED.natural_language,`);
    lines.push(`  compiled_rule = EXCLUDED.compiled_rule,`);
    lines.push(`  is_active = EXCLUDED.is_active,`);
    lines.push(`  updated_at = NOW();`);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// JSON generation
// ---------------------------------------------------------------------------

function generateJSON(): object {
  return {
    _meta: {
      generated_at: new Date().toISOString(),
      generator: 'scripts/generate-synthetic-data.ts',
      description: 'Seed data for Arova demo merchant SportKart India',
    },
    merchant,
    products: products.map((p) => ({
      ...p,
      attributes: p.attributes,
      json_ld: p.json_ld,
    })),
    rules: rules.map((r) => ({
      ...r,
      compiled_rule: r.compiled_rule,
    })),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  if (wantSql) {
    console.log(generateSQL());
  }

  if (wantJson) {
    const data = generateJSON();
    const outPath = join(__dirname, '..', 'seed-data.json');
    writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
    console.error(`[generate-synthetic-data] Wrote ${outPath}`);
  }

  if (!wantSql && !wantJson) {
    console.log(generateSQL());
  }

  console.error(`[generate-synthetic-data] Done. Merchant: ${merchant.name}, Products: ${products.length}, Rules: ${rules.length}`);
}

main();
