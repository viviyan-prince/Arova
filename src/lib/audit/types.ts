export enum AuditEventType {
  DISCOVERY = 'DISCOVERY',
  QUERY = 'QUERY',
  NEGOTIATION_STEP = 'NEGOTIATION_STEP',
  RULE_EVALUATION = 'RULE_EVALUATION',
  CHECKOUT = 'CHECKOUT',
  PAYMENT_ATTEMPT = 'PAYMENT_ATTEMPT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE = 'PAYMENT_FAILURE',
  TRUST_UPDATE = 'TRUST_UPDATE',
  CATALOG_GENERATED = 'CATALOG_GENERATED',
  RULE_COMPILED = 'RULE_COMPILED',
}

export interface AuditEvent {
  merchant_id: string;
  session_id?: string;
  transaction_id?: string;
  event_type: string;
  event_data: Record<string, unknown>;
  ai_involved: boolean;
  ai_model?: string;
  ai_input_summary?: string;
  ai_output_summary?: string;
  decision_reasoning: string;
  latency_ms: number;
}
