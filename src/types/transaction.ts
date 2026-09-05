import { z } from 'zod';

// ---------------------------------------------------------------------------
// Transaction — tracks an order through the Razorpay lifecycle
// ---------------------------------------------------------------------------

export const TransactionStatusEnum = z.enum([
  'initiated',
  'authorized',
  'captured',
  'failed',
  'refunded',
]);

export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;

export interface Transaction {
  id: string;
  session_id: string;
  merchant_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  items: Array<{
    product_id: string;
    quantity: number;
    agreed_price: number;
  }>;
  negotiation_history: Array<{
    proposed_price: number;
    counter_offer?: number;
    status: string;
    timestamp: string;
  }>;
  payment_method: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// CompiledRule — deterministic rule engine entry
// ---------------------------------------------------------------------------

export const RuleTypeEnum = z.enum([
  'acceptance',
  'pricing',
  'shipping',
  'negotiation',
  'return',
]);

export type RuleType = z.infer<typeof RuleTypeEnum>;

export const ConditionOperatorEnum = z.enum([
  'gt',
  'lt',
  'eq',
  'gte',
  'lte',
  'in',
  'between',
]);

export type ConditionOperator = z.infer<typeof ConditionOperatorEnum>;

export interface CompiledRule {
  id: string;
  type: RuleType;
  condition: {
    field: string;
    operator: ConditionOperator;
    value: any;
  };
  action: {
    type: 'accept' | 'reject' | 'apply_discount' | 'modify';
    parameters: Record<string, any>;
  };
  priority: number;
}

export const CompiledRuleSchema = z.object({
  id: z.string().uuid(),
  type: RuleTypeEnum,
  condition: z.object({
    field: z.string(),
    operator: ConditionOperatorEnum,
    value: z.any(),
  }),
  action: z.object({
    type: z.enum(['accept', 'reject', 'apply_discount', 'modify']),
    parameters: z.record(z.string(), z.any()),
  }),
  priority: z.number().int().nonnegative(),
});

export type CompiledRuleInput = z.infer<typeof CompiledRuleSchema>;

// ---------------------------------------------------------------------------
// AgentSession — tracks a buyer-agent conversation
// ---------------------------------------------------------------------------

export interface AgentSession {
  id: string;
  merchant_id: string;
  agent_identity: string;
  agent_type: string;
  trust_score: number;
  spending_limit: number;
  total_spent: number;
  interaction_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const CreateAgentSessionSchema = z.object({
  merchant_id: z.string().uuid(),
  agent_identity: z.string().min(1).max(512),
  agent_type: z.string().min(1).max(128),
  trust_score: z.number().min(0).max(1).optional().default(0.5),
  spending_limit: z.number().nonnegative().optional().default(100000),
  total_spent: z.number().nonnegative().optional().default(0),
  interaction_count: z.number().int().nonnegative().optional().default(0),
  status: z.string().optional().default('active'),
});

export type CreateAgentSessionInput = z.infer<typeof CreateAgentSessionSchema>;

// ---------------------------------------------------------------------------
// AuditEvent — immutable audit log row
// ---------------------------------------------------------------------------

export interface AuditEvent {
  id: string;
  merchant_id: string;
  session_id: string | null;
  transaction_id: string | null;
  event_type: string;
  event_data: any;
  ai_involved: boolean;
  ai_model: string | null;
  ai_input_summary: string | null;
  ai_output_summary: string | null;
  decision_reasoning: string;
  latency_ms: number;
  created_at: string;
}

export const CreateAuditEventSchema = z.object({
  merchant_id: z.string().uuid(),
  session_id: z.string().uuid().nullable().optional().default(null),
  transaction_id: z.string().uuid().nullable().optional().default(null),
  event_type: z.string().min(1).max(128),
  event_data: z.any().optional().default({}),
  ai_involved: z.boolean(),
  ai_model: z.string().nullable().optional().default(null),
  ai_input_summary: z.string().nullable().optional().default(null),
  ai_output_summary: z.string().nullable().optional().default(null),
  decision_reasoning: z.string().optional().default(''),
  latency_ms: z.number().nonnegative(),
});

export type CreateAuditEventInput = z.infer<typeof CreateAuditEventSchema>;
