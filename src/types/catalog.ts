import { z } from 'zod';

// ---------------------------------------------------------------------------
// CatalogProduct — canonical product record stored in Supabase
// ---------------------------------------------------------------------------

export interface CatalogProduct {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  semantic_description: string;
  price: number; // INR, stored as NUMERIC(12,2) in DB
  currency: string;
  category: string;
  subcategory: string;
  attributes: Record<string, any>; // size, color, material, weight, etc.
  inventory_count: number;
  is_active: boolean;
  json_ld: any; // Schema.org Product structured data
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Zod schemas — validation for API & DB boundaries
// ---------------------------------------------------------------------------

export const CreateProductInputSchema = z.object({
  merchant_id: z.string().uuid(),
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(4096),
  semantic_description: z.string().max(8192).optional().default(''),
  price: z.number().positive().finite(),
  currency: z.string().length(3).optional().default('INR'),
  category: z.string().min(1).max(128),
  subcategory: z.string().max(128).optional().default(''),
  attributes: z.record(z.string(), z.any()).optional().default({}),
  inventory_count: z.number().int().nonnegative().optional().default(0),
  is_active: z.boolean().optional().default(true),
  json_ld: z.any().optional().default(null),
});

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;

export const UpdateProductInputSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  description: z.string().min(1).max(4096).optional(),
  semantic_description: z.string().max(8192).optional(),
  price: z.number().positive().finite().optional(),
  currency: z.string().length(3).optional(),
  category: z.string().min(1).max(128).optional(),
  subcategory: z.string().max(128).optional(),
  attributes: z.record(z.string(), z.any()).optional(),
  inventory_count: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
  json_ld: z.any().optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
