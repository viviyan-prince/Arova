import { z } from 'zod';
import type { CatalogProduct } from '@/types/catalog';

// ---------------------------------------------------------------------------
// Query — product search (exact + semantic)
// ---------------------------------------------------------------------------

export interface AgentQueryRequest {
  slug: string;
  query: string;
  filters?: {
    category?: string;
    min_price?: number;
    max_price?: number;
    attributes?: Record<string, any>;
  };
  session_id?: string;
}

export const AgentQueryRequestSchema = z.object({
  slug: z.string().min(1),
  query: z.string().min(1).max(1024),
  filters: z
    .object({
      category: z.string().optional(),
      min_price: z.number().nonnegative().optional(),
      max_price: z.number().positive().optional(),
      attributes: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  session_id: z.string().uuid().optional(),
});

export type AgentQueryRequestInput = z.infer<typeof AgentQueryRequestSchema>;

export interface AgentQueryResponse {
  products: CatalogProduct[];
  count: number;
  method_used: 'exact_match' | 'semantic_search';
}

// ---------------------------------------------------------------------------
// Negotiate — price negotiation against commerce rules
// ---------------------------------------------------------------------------

export interface AgentNegotiateRequest {
  slug: string;
  product_id: string;
  quantity: number;
  proposed_price: number;
  session_id?: string;
}

export const AgentNegotiateRequestSchema = z.object({
  slug: z.string().min(1),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  proposed_price: z.number().positive().finite(),
  session_id: z.string().uuid().optional(),
});

export type AgentNegotiateRequestInput = z.infer<typeof AgentNegotiateRequestSchema>;

export interface AgentNegotiateResponse {
  status: 'accepted' | 'counter_offer' | 'rejected';
  final_price?: number;
  counter_offer?: number;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Checkout — create order + Razorpay payment link
// ---------------------------------------------------------------------------

export interface AgentCheckoutRequest {
  slug: string;
  items: Array<{
    product_id: string;
    quantity: number;
    agreed_price: number;
  }>;
  payment_method?: string;
  session_id?: string;
}

export const AgentCheckoutRequestSchema = z.object({
  slug: z.string().min(1),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        agreed_price: z.number().positive().finite(),
      }),
    )
    .min(1),
  payment_method: z.string().optional(),
  session_id: z.string().uuid().optional(),
});

export type AgentCheckoutRequestInput = z.infer<typeof AgentCheckoutRequestSchema>;

export interface AgentCheckoutResponse {
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  payment_link_url: string;
}

// ---------------------------------------------------------------------------
// Status — order + payment status lookup
// ---------------------------------------------------------------------------

export interface AgentStatusResponse {
  order_id: string;
  order_status: string;
  payment_status: string;
  items: any[];
}
