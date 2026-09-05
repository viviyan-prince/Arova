import type { ZodError } from 'zod';
import {
  AgentQueryRequestSchema,
  type AgentQueryRequest,
  AgentNegotiateRequestSchema,
  type AgentNegotiateRequest,
  AgentCheckoutRequestSchema,
  type AgentCheckoutRequest,
} from '@/types/agent-protocol';

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export interface SlugValidationSuccess {
  success: true;
  slug: string;
}

export interface SlugValidationFailure {
  success: false;
  error: string;
}

export type SlugValidationResult = SlugValidationSuccess | SlugValidationFailure;

// ---------------------------------------------------------------------------
// Slug pattern (matches merchant.ts schema: lowercase alphanum with hyphens)
// ---------------------------------------------------------------------------

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 64;

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/**
 * Validate an agent product-query request body.
 * Uses Zod safeParse -- never throws.
 */
export function validateAgentQuery(
  data: unknown,
): ValidationResult<AgentQueryRequest> {
  const result = AgentQueryRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as AgentQueryRequest };
  }
  return {
    success: false,
    errors: flattenZodErrors(result.error),
  };
}

/**
 * Validate an agent negotiate request body.
 * Uses Zod safeParse -- never throws.
 */
export function validateAgentNegotiate(
  data: unknown,
): ValidationResult<AgentNegotiateRequest> {
  const result = AgentNegotiateRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as AgentNegotiateRequest };
  }
  return {
    success: false,
    errors: flattenZodErrors(result.error),
  };
}

/**
 * Validate an agent checkout request body.
 * Uses Zod safeParse -- never throws.
 */
export function validateAgentCheckout(
  data: unknown,
): ValidationResult<AgentCheckoutRequest> {
  const result = AgentCheckoutRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as AgentCheckoutRequest };
  }
  return {
    success: false,
    errors: flattenZodErrors(result.error),
  };
}

/**
 * Validate a merchant slug path parameter.
 * Pure string check -- never throws.
 */
export function validateMerchantSlug(slug: unknown): SlugValidationResult {
  if (typeof slug !== 'string') {
    return { success: false, error: 'Slug must be a string.' };
  }

  if (slug.length === 0) {
    return { success: false, error: 'Slug must not be empty.' };
  }

  if (slug.length > SLUG_MAX_LENGTH) {
    return {
      success: false,
      error: `Slug must be at most ${SLUG_MAX_LENGTH} characters.`,
    };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      success: false,
      error: 'Slug must be lowercase alphanumeric with hyphens only.',
    };
  }

  return { success: true, slug };
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function flattenZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : '';
    return `${path}${issue.message}`;
  });
}
