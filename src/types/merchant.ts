import { z } from 'zod';

// ---------------------------------------------------------------------------
// Merchant — row in the merchants table
// ---------------------------------------------------------------------------

export interface Merchant {
  id: string;
  name: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  business_type: string;
  agent_endpoint_slug: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const CreateMerchantInputSchema = z.object({
  name: z.string().min(1).max(256),
  razorpay_key_id: z.string().min(1),
  razorpay_key_secret: z.string().min(1),
  business_type: z.string().min(1).max(128),
  agent_endpoint_slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  settings: z.record(z.string(), z.any()).optional().default({}),
});

export type CreateMerchantInput = z.infer<typeof CreateMerchantInputSchema>;

// ---------------------------------------------------------------------------
// MerchantCapabilities — returned by GET /api/agent/:slug/capabilities
// ---------------------------------------------------------------------------

export interface MerchantCapabilities {
  merchant: {
    name: string;
    slug: string;
    business_type: string;
  };
  protocol_version: '1.0';
  capabilities: string[];
  categories: string[];
  payment_methods: string[];
  currency: string;
  endpoints: Record<string, string>;
}

export const MerchantCapabilitiesSchema = z.object({
  merchant: z.object({
    name: z.string(),
    slug: z.string(),
    business_type: z.string(),
  }),
  protocol_version: z.literal('1.0'),
  capabilities: z.array(z.string()),
  categories: z.array(z.string()),
  payment_methods: z.array(z.string()),
  currency: z.string().length(3),
  endpoints: z.record(z.string(), z.string()),
});

export type MerchantCapabilitiesOutput = z.infer<typeof MerchantCapabilitiesSchema>;
