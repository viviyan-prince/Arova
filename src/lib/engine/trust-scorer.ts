import {
  TRUST_SCORE_BASE,
  TRUST_SCORE_IDENTITY_BONUS,
  TRUST_SCORE_FIRST_TXN,
  TRUST_SCORE_REPEAT_TXN,
  TRUST_SCORE_MAX_REPEAT,
  TRUST_SCORE_MALFORMED_PENALTY,
  TRUST_SCORE_MANIPULATION_PENALTY,
  TRUST_SCORE_RATELIMIT_PENALTY,
  TRUST_SCORE_BLOCK_THRESHOLD,
} from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrustEvent {
  type: string;
  success: boolean;
}

// ---------------------------------------------------------------------------
// Trust score calculator
// ---------------------------------------------------------------------------

/**
 * Compute a trust score (0-100) from a sequence of session events.
 *
 * Pure function with no side effects and no AI involvement.
 * Deterministic: same events always produce the same score.
 */
export function calculateTrustScore(events: TrustEvent[]): number {
  if (!events || events.length === 0) {
    return clamp(TRUST_SCORE_BASE);
  }

  let score = TRUST_SCORE_BASE;

  // Identity verification bonus (once)
  const hasIdentityVerified = events.some((e) => e.type === 'identity_verified');
  if (hasIdentityVerified) {
    score += TRUST_SCORE_IDENTITY_BONUS;
  }

  // Successful transactions
  const successfulTxns = events.filter(
    (e) => e.type === 'transaction' && e.success,
  );
  if (successfulTxns.length >= 1) {
    // First successful transaction bonus
    score += TRUST_SCORE_FIRST_TXN;

    // Repeat transaction bonuses (capped)
    const repeatCount = successfulTxns.length - 1;
    const repeatBonus = Math.min(
      repeatCount * TRUST_SCORE_REPEAT_TXN,
      TRUST_SCORE_MAX_REPEAT,
    );
    score += repeatBonus;
  }

  // Penalties
  const malformedCount = events.filter((e) => e.type === 'malformed_request').length;
  score += malformedCount * TRUST_SCORE_MALFORMED_PENALTY;

  const manipulationCount = events.filter(
    (e) => e.type === 'manipulation_attempt',
  ).length;
  score += manipulationCount * TRUST_SCORE_MANIPULATION_PENALTY;

  const rateLimitCount = events.filter(
    (e) => e.type === 'rate_limit_exceeded',
  ).length;
  score += rateLimitCount * TRUST_SCORE_RATELIMIT_PENALTY;

  return clamp(score);
}

// ---------------------------------------------------------------------------
// Block check
// ---------------------------------------------------------------------------

/**
 * Returns true if the trust score is below the blocking threshold.
 */
export function isBlocked(score: number): boolean {
  return score < TRUST_SCORE_BLOCK_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
