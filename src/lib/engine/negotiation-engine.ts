import type { CompiledRule } from '@/types/transaction';
import { PAISE_MULTIPLIER } from '@/lib/utils/constants';
import { evaluateRules } from '@/lib/engine/rule-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NegotiateParams {
  productPrice: number;
  proposedPrice: number;
  quantity: number;
  rules: CompiledRule[];
}

export interface NegotiateResult {
  status: 'accepted' | 'counter_offer' | 'rejected';
  finalPrice?: number;
  counterOffer?: number;
  reasoning: string;
  floorPrice: number;
}

// ---------------------------------------------------------------------------
// Integer arithmetic helpers (paise)
// ---------------------------------------------------------------------------

function toPaise(amount: number): number {
  return Math.round(amount * PAISE_MULTIPLIER);
}

function fromPaise(paise: number): number {
  return paise / PAISE_MULTIPLIER;
}

// ---------------------------------------------------------------------------
// Negotiation engine
// ---------------------------------------------------------------------------

/**
 * Deterministic price negotiation against compiled commerce rules.
 *
 * All monetary arithmetic is performed in integer paise to avoid
 * floating-point drift. The final prices are converted back to rupees.
 */
export function negotiate(params: NegotiateParams): NegotiateResult {
  const { productPrice, proposedPrice, quantity, rules } = params;

  // Guard: nonsensical inputs
  if (productPrice <= 0) {
    return {
      status: 'rejected',
      reasoning: 'Product price must be positive.',
      floorPrice: 0,
    };
  }
  if (proposedPrice <= 0) {
    return {
      status: 'rejected',
      reasoning: 'Proposed price must be positive.',
      floorPrice: productPrice,
    };
  }
  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return {
      status: 'rejected',
      reasoning: 'Quantity must be a positive integer.',
      floorPrice: productPrice,
    };
  }

  // --- Step 1: find negotiation rule to determine max discount percent ---
  const negotiationRules = rules.filter((r) => r.type === 'negotiation');
  let maxDiscountPercent = 0;

  if (negotiationRules.length > 0) {
    // Sort by priority; take first whose condition matches (or first overall).
    const sorted = [...negotiationRules].sort((a, b) => a.priority - b.priority);
    for (const rule of sorted) {
      const discount = rule.action.parameters.max_discount_percent;
      if (typeof discount === 'number' && discount > 0) {
        maxDiscountPercent = discount;
        break;
      }
    }
  }

  // --- Step 2: compute floor price in paise ---
  const productPricePaise = toPaise(productPrice);
  const floorPricePaise = Math.round(
    productPricePaise * (1 - maxDiscountPercent / 100),
  );
  const proposedPricePaise = toPaise(proposedPrice);

  // --- Step 3: negotiation decision ---
  let status: NegotiateResult['status'];
  let acceptedPricePaise: number;
  let counterOfferPaise: number | undefined;
  let reasoning: string;

  if (proposedPricePaise >= productPricePaise) {
    // Buyer offered at or above list price -- accept at list price.
    status = 'accepted';
    acceptedPricePaise = productPricePaise;
    reasoning = 'Proposed price meets or exceeds the product price.';
  } else if (proposedPricePaise >= floorPricePaise) {
    // Buyer offered above the floor -- accept at proposed price.
    status = 'accepted';
    acceptedPricePaise = proposedPricePaise;
    reasoning = `Proposed price is within the allowed discount range (max ${maxDiscountPercent}%).`;
  } else {
    // Buyer offered below the floor.
    const gapPaise = floorPricePaise - proposedPricePaise;
    const tenPercentFloorPaise = Math.round(floorPricePaise * 0.1);

    if (gapPaise <= tenPercentFloorPaise) {
      // Within 10% of floor -- counter at floor.
      status = 'counter_offer';
      acceptedPricePaise = floorPricePaise;
      counterOfferPaise = floorPricePaise;
      reasoning = `Proposed price is close to the floor. Counter-offering at the minimum accepted price.`;
    } else {
      // Too far below the floor -- reject.
      status = 'rejected';
      acceptedPricePaise = 0;
      reasoning = `Proposed price is more than 10% below the floor price (${fromPaise(floorPricePaise)} INR). Cannot accept.`;
    }
  }

  // --- Step 4: apply quantity-based pricing rules ---
  if (status === 'accepted' && acceptedPricePaise > 0) {
    const pricingRules = rules.filter((r) => r.type === 'pricing');
    if (pricingRules.length > 0) {
      const pricingResult = evaluateRules(pricingRules, { quantity });
      if (pricingResult.matchedRule && pricingResult.action) {
        const discountPercent = pricingResult.action.parameters.discount_percent;
        if (typeof discountPercent === 'number' && discountPercent > 0) {
          const discountPaise = Math.round(
            acceptedPricePaise * (discountPercent / 100),
          );
          acceptedPricePaise = acceptedPricePaise - discountPaise;

          // Never go below the floor even with quantity discounts.
          if (acceptedPricePaise < floorPricePaise) {
            acceptedPricePaise = floorPricePaise;
          }

          reasoning += ` Additional ${discountPercent}% quantity discount applied for ${quantity} units.`;
        }
      }
    }
  }

  // --- Step 5: build result ---
  const result: NegotiateResult = {
    status,
    reasoning,
    floorPrice: fromPaise(floorPricePaise),
  };

  if (status === 'accepted') {
    result.finalPrice = fromPaise(acceptedPricePaise);
  }
  if (counterOfferPaise !== undefined) {
    result.counterOffer = fromPaise(counterOfferPaise);
  }

  return result;
}
