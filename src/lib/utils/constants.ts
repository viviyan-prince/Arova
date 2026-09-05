// --- Merchant defaults ---
export const DEFAULT_MERCHANT_SLUG = 'sportkart';

// --- Trust scoring ---
export const TRUST_SCORE_BASE = 50;
export const TRUST_SCORE_IDENTITY_BONUS = 15;
export const TRUST_SCORE_FIRST_TXN = 10;
export const TRUST_SCORE_REPEAT_TXN = 5;
export const TRUST_SCORE_MAX_REPEAT = 20;
export const TRUST_SCORE_MALFORMED_PENALTY = -10;
export const TRUST_SCORE_MANIPULATION_PENALTY = -25;
export const TRUST_SCORE_RATELIMIT_PENALTY = -15;
export const TRUST_SCORE_BLOCK_THRESHOLD = 20;

// --- Negotiation ---
export const MAX_NEGOTIATION_ROUNDS = 3;

// --- Rate limiting ---
export const RATE_LIMIT_PER_MINUTE = 20;

// --- Currency ---
export const PAISE_MULTIPLIER = 100;
