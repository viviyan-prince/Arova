-- seed.sql — SportKart India demo merchant, 15 products, 5 commerce rules
-- Run after all migrations: psql $DATABASE_URL < supabase/seed.sql

-- =========================================================================
-- 1. Merchant
-- =========================================================================

INSERT INTO merchants (id, name, razorpay_key_id, razorpay_key_secret, business_type, agent_endpoint_slug, settings)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'SportKart India',
  'rzp_test_placeholder',
  'rzp_secret_placeholder',
  'sports_retail',
  'sportkart',
  '{"negotiation_enabled": true, "max_discount_pct": 15, "auto_accept_threshold": 0.95}'::jsonb
);

-- =========================================================================
-- 2. Catalog Products (15 total: 5 footwear, 5 apparel, 5 accessories)
-- =========================================================================

-- ----- Footwear (5) -----

INSERT INTO catalog_products (id, merchant_id, name, description, semantic_description, price, currency, category, subcategory, attributes, inventory_count, is_active, json_ld)
VALUES
(
  '11111111-1111-1111-1111-111111111101',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'ProStride Marathon Running Shoes',
  'Lightweight marathon running shoes with responsive EVA midsole cushioning and breathable mesh upper. Engineered for long-distance runners seeking comfort and speed.',
  'running shoes marathon lightweight breathable cushioned EVA midsole road running neutral pronation men women',
  4999.00,
  'INR',
  'footwear',
  'running_shoes',
  '{"sizes": ["UK6","UK7","UK8","UK9","UK10","UK11"], "colors": ["black/red","white/blue","grey/neon"], "material": "mesh_upper_eva_sole", "weight_grams": 260, "gender": "unisex"}'::jsonb,
  120,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "ProStride Marathon Running Shoes", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111102',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'TrailBlazer All-Terrain Hiking Boots',
  'Waterproof hiking boots with Vibram outsole and ankle support. Built for rugged mountain trails and unpredictable weather conditions.',
  'hiking boots waterproof trail trekking ankle support vibram outsole mountain outdoor adventure',
  6499.00,
  'INR',
  'footwear',
  'hiking_boots',
  '{"sizes": ["UK7","UK8","UK9","UK10","UK11"], "colors": ["brown/olive","black/grey"], "material": "leather_gore_tex", "weight_grams": 580, "gender": "unisex", "waterproof": true}'::jsonb,
  65,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "TrailBlazer All-Terrain Hiking Boots", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111103',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'CourtKing Badminton Shoes',
  'Non-marking gum sole badminton shoes with lateral support and cushioned insole. Designed for quick court movements and explosive jumps.',
  'badminton shoes court non-marking gum sole indoor sports lateral support lightweight',
  2799.00,
  'INR',
  'footwear',
  'court_shoes',
  '{"sizes": ["UK6","UK7","UK8","UK9","UK10"], "colors": ["white/blue","black/yellow"], "material": "synthetic_mesh", "weight_grams": 290, "gender": "unisex", "non_marking": true}'::jsonb,
  200,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "CourtKing Badminton Shoes", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111104',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'SprintX Track & Field Spikes',
  'Competition-grade sprint spikes with 7-pin configuration and ultra-light Pebax plate. For 100m to 400m events on synthetic tracks.',
  'track spikes sprint competition athletics running spike plate pebax lightweight speed',
  3499.00,
  'INR',
  'footwear',
  'track_spikes',
  '{"sizes": ["UK6","UK7","UK8","UK9","UK10"], "colors": ["neon_green/black","orange/white"], "material": "synthetic_pebax_plate", "weight_grams": 150, "gender": "unisex", "spike_count": 7}'::jsonb,
  45,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "SprintX Track & Field Spikes", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111105',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'FlexFit Training Sneakers',
  'Versatile cross-training sneakers with flat stable base for weightlifting and flexible forefoot for agility drills. Everyday gym shoe.',
  'training sneakers gym cross-training weightlifting versatile flat sole everyday workout fitness',
  3299.00,
  'INR',
  'footwear',
  'training_shoes',
  '{"sizes": ["UK6","UK7","UK8","UK9","UK10","UK11"], "colors": ["black/white","navy/grey","all_black"], "material": "mesh_rubber_sole", "weight_grams": 310, "gender": "unisex"}'::jsonb,
  180,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "FlexFit Training Sneakers", "brand": "SportKart"}'::jsonb
),

-- ----- Apparel (5) -----

(
  '11111111-1111-1111-1111-111111111201',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'DryFit Pro Running T-Shirt',
  'Moisture-wicking polyester running tee with flatlock seams and reflective logos. Keeps you cool and visible during early morning or late evening runs.',
  'running t-shirt moisture wicking dryfit polyester lightweight breathable reflective jogging',
  1299.00,
  'INR',
  'apparel',
  'tops',
  '{"sizes": ["S","M","L","XL","XXL"], "colors": ["black","white","electric_blue","neon_yellow"], "material": "polyester_dryfit", "weight_grams": 120, "gender": "unisex"}'::jsonb,
  350,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "DryFit Pro Running T-Shirt", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111202',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'StormShield Windbreaker Jacket',
  'Packable windbreaker jacket with water-resistant coating and adjustable hood. Packs into its own chest pocket for easy carrying.',
  'windbreaker jacket water resistant packable lightweight running cycling outdoor hood',
  2499.00,
  'INR',
  'apparel',
  'outerwear',
  '{"sizes": ["S","M","L","XL","XXL"], "colors": ["navy","black","olive","red"], "material": "nylon_ripstop", "weight_grams": 180, "gender": "unisex", "packable": true}'::jsonb,
  90,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "StormShield Windbreaker Jacket", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111203',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'FlexMotion Training Shorts',
  'Four-way stretch training shorts with zippered pocket and internal liner. Designed for gym workouts, HIIT sessions, and outdoor runs.',
  'training shorts stretch gym workout running HIIT zippered pocket liner comfortable',
  999.00,
  'INR',
  'apparel',
  'bottoms',
  '{"sizes": ["S","M","L","XL","XXL"], "colors": ["black","grey","navy"], "material": "polyester_spandex", "weight_grams": 140, "gender": "men", "inseam_inches": 7}'::jsonb,
  275,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "FlexMotion Training Shorts", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111204',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'ThermoLayer Compression Tights',
  'Full-length compression tights with graduated compression zones for muscle support and recovery. Flat waistband with internal drawcord.',
  'compression tights full length muscle support recovery graduated compression thermal base layer',
  1799.00,
  'INR',
  'apparel',
  'bottoms',
  '{"sizes": ["S","M","L","XL"], "colors": ["black","dark_grey"], "material": "nylon_spandex", "weight_grams": 160, "gender": "unisex", "compression_level": "moderate"}'::jsonb,
  150,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "ThermoLayer Compression Tights", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111205',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'ZenFlow Yoga Tank Top',
  'Relaxed-fit yoga tank with built-in shelf bra and open-back design. Soft bamboo blend fabric for comfort during hot yoga and pilates.',
  'yoga tank top bamboo fabric relaxed fit shelf bra open back pilates hot yoga women',
  899.00,
  'INR',
  'apparel',
  'tops',
  '{"sizes": ["XS","S","M","L","XL"], "colors": ["blush_pink","sage_green","black","lavender"], "material": "bamboo_spandex", "weight_grams": 95, "gender": "women"}'::jsonb,
  220,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "ZenFlow Yoga Tank Top", "brand": "SportKart"}'::jsonb
),

-- ----- Accessories (5) -----

(
  '11111111-1111-1111-1111-111111111301',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'GripMax Gym Gloves',
  'Padded gym gloves with silicone grip palms and adjustable wrist wrap. Protects hands during heavy lifting and pull-ups.',
  'gym gloves weightlifting grip padded wrist wrap pull-up deadlift protection training',
  699.00,
  'INR',
  'accessories',
  'gloves',
  '{"sizes": ["S","M","L","XL"], "colors": ["black","black/red"], "material": "synthetic_leather_neoprene", "weight_grams": 80, "gender": "unisex"}'::jsonb,
  300,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "GripMax Gym Gloves", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111302',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'HydroFlask Sports Water Bottle 750ml',
  'Double-walled insulated stainless steel water bottle with leak-proof sport cap. Keeps water cold for 24 hours.',
  'water bottle insulated stainless steel sports hydration 750ml leak proof cold gym running cycling',
  1199.00,
  'INR',
  'accessories',
  'hydration',
  '{"colors": ["matte_black","arctic_white","steel_blue"], "material": "stainless_steel_18_8", "capacity_ml": 750, "weight_grams": 340, "insulated": true}'::jsonb,
  400,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "HydroFlask Sports Water Bottle 750ml", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111303',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'PulseBeat Fitness Resistance Band Set',
  'Set of 5 latex resistance bands (extra light to extra heavy) with door anchor and carry bag. For home workouts, physiotherapy, and warm-ups.',
  'resistance bands fitness set latex exercise home workout physiotherapy warm up stretching strength',
  599.00,
  'INR',
  'accessories',
  'fitness_equipment',
  '{"colors": ["multicolor_set"], "material": "natural_latex", "weight_grams": 250, "band_count": 5, "resistance_levels": ["extra_light","light","medium","heavy","extra_heavy"]}'::jsonb,
  500,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "PulseBeat Fitness Resistance Band Set", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111304',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'SunStrike Polarized Sports Sunglasses',
  'Wraparound polarized sunglasses with UV400 protection and anti-slip nose pads. Ideal for cycling, running, and outdoor sports.',
  'sports sunglasses polarized UV400 cycling running wraparound lightweight anti-slip outdoor',
  1499.00,
  'INR',
  'accessories',
  'eyewear',
  '{"colors": ["matte_black/smoke","white/blue_mirror","tortoise/brown"], "material": "TR90_frame_polycarbonate_lens", "weight_grams": 28, "uv_protection": "UV400", "polarized": true}'::jsonb,
  175,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "SunStrike Polarized Sports Sunglasses", "brand": "SportKart"}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111305',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'ProGrip Yoga Mat 6mm',
  'Non-slip TPE yoga mat with alignment lines and carrying strap. Eco-friendly material, 6mm thick for joint cushioning.',
  'yoga mat non-slip TPE eco-friendly alignment lines 6mm thick cushioning pilates stretching floor exercise',
  1899.00,
  'INR',
  'accessories',
  'yoga_equipment',
  '{"colors": ["purple/pink","teal/grey","black/charcoal"], "material": "TPE_eco", "weight_grams": 900, "thickness_mm": 6, "length_cm": 183, "width_cm": 61}'::jsonb,
  250,
  TRUE,
  '{"@context": "https://schema.org", "@type": "Product", "name": "ProGrip Yoga Mat 6mm", "brand": "SportKart"}'::jsonb
);

-- =========================================================================
-- 3. Commerce Rules (5 rules in plain English + compiled JSONB)
-- =========================================================================

INSERT INTO commerce_rules (id, merchant_id, rule_type, rule_text, compiled_rule, is_compiled, test_results, priority, is_active)
VALUES
(
  '22222222-2222-2222-2222-222222222201',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'negotiation',
  'Allow up to 10% discount on orders with quantity 3 or more of the same item',
  '{"type": "negotiation", "condition": {"field": "quantity", "operator": "gte", "value": 3}, "action": {"type": "apply_discount", "parameters": {"max_discount_percent": 10}}}'::jsonb,
  TRUE,
  NULL,
  100,
  TRUE
),
(
  '22222222-2222-2222-2222-222222222202',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'negotiation',
  'Allow up to 15% discount on orders totalling more than 10000 INR',
  '{"type": "negotiation", "condition": {"field": "order_total", "operator": "gt", "value": 10000}, "action": {"type": "apply_discount", "parameters": {"max_discount_percent": 15}}}'::jsonb,
  TRUE,
  NULL,
  90,
  TRUE
),
(
  '22222222-2222-2222-2222-222222222203',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'pricing',
  'Reject any negotiated price that is more than 20% below the listed price',
  '{"type": "pricing", "condition": {"field": "discount_pct", "operator": "gt", "value": 20}, "action": {"type": "reject", "parameters": {"reason": "Maximum allowable discount is 20%"}}}'::jsonb,
  TRUE,
  NULL,
  200,
  TRUE
),
(
  '22222222-2222-2222-2222-222222222204',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'shipping',
  'Free shipping on orders above 2000 INR',
  '{"type": "shipping", "condition": {"field": "order_total", "operator": "gte", "value": 2000}, "action": {"type": "modify", "parameters": {"shipping_cost": 0, "reason": "Free shipping on orders above INR 2000"}}}'::jsonb,
  TRUE,
  NULL,
  50,
  TRUE
),
(
  '22222222-2222-2222-2222-222222222205',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'acceptance',
  'Auto-accept orders where the proposed price is within 5% of the listed price',
  '{"type": "acceptance", "condition": {"field": "discount_pct", "operator": "lte", "value": 5}, "action": {"type": "accept", "parameters": {"auto": true, "reason": "Price within auto-accept threshold"}}}'::jsonb,
  TRUE,
  NULL,
  150,
  TRUE
);
