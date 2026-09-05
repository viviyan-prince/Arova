# Arova -- Technical Architecture

## System Overview

Arova connects three actors through four components:

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|     Merchant      |       |  AI Buyer Agent   |       |     Razorpay      |
|  (Dashboard UI)   |       |  (External LLM)   |       |  (Payment Rail)   |
|                   |       |                   |       |                   |
+--------+----------+       +--------+----------+       +--------+----------+
         |                           |                           |
         v                           v                           |
+--------+----------+       +--------+----------+               |
|                   |       |                   |               |
| Merchant APIs     |       |  Agent Gateway    |               |
| /api/merchant/*   |       |  /api/agent/*     |               |
|                   |       |                   |               |
+--------+----------+       +--------+----------+               |
         |                           |                           |
         +-------------+-------------+                           |
                       |                                         |
              +--------v----------+                              |
              |                   |                              |
              |   Rule Engine     |   <-- 80% deterministic      |
              |   Trust Scorer    |                              |
              |   Negotiation     |                              |
              |                   |                              |
              +--------+----------+                              |
                       |                                         |
            +----------+-----------+                             |
            |                      |                             |
   +--------v----------+  +--------v----------+                  |
   |                   |  |                   +------------------+
   |    AI Layer       |  |  Razorpay SDK     |
   |  Gemini / Groq    |  |  Orders/Payments  |
   |  (20% of logic)   |  |  Webhooks         |
   |                   |  |                   |
   +--------+----------+  +--------+----------+
            |                      |
            +----------+-----------+
                       |
              +--------v----------+
              |                   |
              |   Supabase DB     |
              |   6 tables        |
              |   + audit_log     |
              |                   |
              +-------------------+
```

### The Four Components

1. **Merchant Dashboard** (`/dashboard`): Web UI for catalog management, rule authoring, and transaction monitoring. Server-rendered with Next.js App Router.

2. **Agent Gateway** (`/api/agent/*`): Structured API that buyer agents call to discover products, negotiate prices, and complete purchases. Every request is validated, trust-scored, and rule-checked before any side effect.

3. **Rule Engine** (`src/lib/engine/`): Pure-function evaluator for commerce rules. Uses switch-case comparison -- never `eval()` or `Function()`. Handles pricing, negotiation bounds, acceptance criteria, shipping, and returns.

4. **AI Layer** (`src/lib/ai/`): Gemini Flash for high-context tasks (catalog generation, rule compilation) and Groq Llama 3.3 70B for low-latency tasks (buyer-agent reasoning, semantic search). AI never touches money operations.

---

## Decision Records

### ADR-001: Next.js App Router for Full-Stack Colocation

**Status**: Accepted

**Context**: Hackathon timeline requires shipping a full-stack application (dashboard, API, agent gateway) in under 48 hours. Separate frontend/backend repos would double deployment complexity.

**Decision**: Use Next.js App Router to colocate React UI, API routes, and server-side logic in a single deployable unit.

**Consequences**:
- Single `npm run dev` starts everything
- API routes live next to the UI that calls them
- TypeScript types are shared across client and server without a build step
- Trade-off: tighter coupling than a microservices split, acceptable for a hackathon

---

### ADR-002: Deterministic Rule Engine Over LLM-for-Everything

**Status**: Accepted

**Context**: LLMs are non-deterministic. A pricing engine that returns different results for identical inputs is a liability. Merchants need predictable, auditable commerce rules.

**Decision**: Build a deterministic rule engine (`src/lib/engine/rule-engine.ts`) that evaluates compiled rules using pure switch-case logic. AI is used only to compile natural-language rules into the deterministic format; the compiled rules are stored and executed without AI involvement.

**Consequences**:
- Pricing and negotiation are reproducible and auditable
- Every rule evaluation is logged with `ai_involved: false`
- Merchants can inspect and manually edit compiled rules
- AI compilation errors are caught at rule-creation time, not transaction time
- Trade-off: less flexible than real-time LLM evaluation, but safer for money

---

### ADR-003: Gemini for Catalog/Rules, Groq for Buyer Agent

**Status**: Accepted

**Context**: Two distinct AI workloads with different requirements. Catalog generation and rule compilation benefit from large context windows (full product catalog, multiple rule examples). Buyer-agent reasoning needs low latency for conversational interactions.

**Decision**: Use Google Gemini Flash (1M token context) for batch/admin tasks and Groq Llama 3.3 70B for real-time agent interactions.

**Rationale**:
| Workload | Model | Why |
|----------|-------|-----|
| Catalog generation | Gemini Flash | Can ingest entire product database + brand guidelines in one prompt |
| Rule compilation | Gemini Flash | Needs examples of all existing rules for consistency |
| Semantic search | Groq Llama 3.3 | Sub-second response for agent queries |
| Buyer-agent reasoning | Groq Llama 3.3 | Low latency critical for multi-turn negotiation |

**Consequences**:
- Two API keys and two client libraries to maintain
- Gemini costs scale with context size; Groq costs scale with request volume
- If either provider has an outage, only half the AI features degrade
- Trade-off: operational complexity vs optimal performance per workload

---

### ADR-004: Schema.org JSON-LD for Catalog Representation

**Status**: Accepted

**Context**: AI buyer agents from different providers need a standard way to understand product catalogs. Proprietary schemas create lock-in and require per-agent adapters.

**Decision**: Store a Schema.org JSON-LD representation (`@type: Product`) alongside every catalog product. The agent gateway returns JSON-LD in discovery and query responses.

**Consequences**:
- Any agent that understands Schema.org can parse our catalog
- Google Shopping, structured data tools, and SEO crawlers work out of the box
- JSON-LD is stored in the `json_ld` column and regenerated on product update
- Trade-off: slightly larger payloads vs universal interoperability

---

### ADR-005: Deterministic Trust Scoring

**Status**: Accepted

**Context**: Trust scoring determines how much latitude a buyer agent gets (discount limits, order caps, rate limits). An AI-based trust score would be unpredictable and gameable.

**Decision**: Implement trust scoring as a deterministic point system (`src/lib/engine/trust-scorer.ts`) with fixed bonuses and penalties:

| Factor | Points |
|--------|--------|
| Base score | 50 |
| Verified identity | +15 |
| First successful transaction | +10 |
| Repeat transaction (max 4x) | +5 each |
| Malformed request | -10 |
| Manipulation attempt | -25 |
| Rate limit violation | -15 |
| Block threshold | 20 |

**Consequences**:
- Trust scores are reproducible: same history always yields same score
- Merchants can reason about why an agent was blocked
- Scores are logged in the audit trail for post-incident review
- Trade-off: cannot detect novel attack patterns (would need AI or heuristics)

---

## AI Usage Map

Every function in the system is classified by whether AI is involved, which model is used, and why.

| Function | AI? | Model | Justification |
|----------|-----|-------|---------------|
| Product CRUD | No | -- | Deterministic database operations |
| Catalog generation from description | Yes | Gemini Flash | Needs brand context + creative generation |
| Semantic product search | Yes | Groq Llama 3.3 | Natural-language understanding of queries |
| Rule creation (plain text) | No | -- | Stored as-is |
| Rule compilation (NL to engine) | Yes | Gemini Flash | Needs full rule set context for consistency |
| Rule evaluation | No | -- | Pure switch-case comparison |
| Trust scoring | No | -- | Deterministic point system |
| Negotiation bounds checking | No | -- | Rule engine evaluation |
| Buyer-agent reasoning | Yes | Groq Llama 3.3 | Multi-turn conversation understanding |
| Order creation | No | -- | Razorpay SDK call |
| Payment verification | No | -- | HMAC signature check |
| Webhook processing | No | -- | Deterministic state machine |
| Audit logging | No | -- | Append-only database insert |
| Discount calculation | No | -- | Arithmetic on rule parameters |

**Key principle**: If the function touches money, moves state, or makes a security decision, it is deterministic. AI is confined to understanding natural language and generating content.

---

## Failure Mode Catalog

### FM-001: Gemini API Unavailable

**Impact**: Catalog generation and rule compilation fail.

**Detection**: HTTP 5xx or timeout from Gemini client.

**Recovery**: Return a structured error to the merchant dashboard with a retry button. Existing compiled rules and catalog products continue to work. Log the failure with `ai_involved: true, ai_model: 'gemini-flash'` in the audit trail.

**Degradation**: Merchant cannot create new AI-generated content but all existing functionality works.

### FM-002: Groq API Unavailable

**Impact**: Semantic search and buyer-agent reasoning fail.

**Detection**: HTTP 5xx or timeout from Groq client.

**Recovery**: Fall back to exact-match product search (SQL ILIKE). Agent negotiation returns a "service temporarily unavailable" response. Log with `ai_model: 'groq-llama-3.3-70b'`.

**Degradation**: Agents can still browse catalog by category/ID and checkout at list price.

### FM-003: Razorpay API Unavailable

**Impact**: Cannot create orders or verify payments.

**Detection**: HTTP 5xx or timeout from Razorpay SDK.

**Recovery**: Return error to agent with Razorpay's status page URL. Do not retry automatically (idempotency risk). Mark transaction as `failed` with `failure_reason: 'razorpay_unavailable'`.

**Degradation**: Full checkout flow blocked. Discovery and negotiation still work.

### FM-004: Supabase Unavailable

**Impact**: All database operations fail.

**Detection**: Connection timeout or query error.

**Recovery**: Return 503 to all endpoints. No in-memory fallback (data consistency is critical).

**Degradation**: Complete service outage. This is the single point of failure.

### FM-005: Trust Score Below Block Threshold

**Impact**: Agent is blocked from further interactions.

**Detection**: `trust_score <= 20` after penalty application.

**Recovery**: Agent receives a 403 with explanation. Merchant can review in dashboard and manually reset trust score. All blocking events are audit-logged.

**Degradation**: Specific agent blocked; other agents unaffected.

### FM-006: Rule Compilation Produces Invalid Output

**Impact**: Commerce rule cannot be activated.

**Detection**: Zod validation of compiled rule fails (`CompiledRuleSchema.safeParse()`).

**Recovery**: Return the validation errors to the merchant with the raw AI output for debugging. Never store an invalid compiled rule. Log the AI output for review.

**Degradation**: Specific rule not available; existing rules unaffected.

### FM-007: Webhook Signature Verification Fails

**Impact**: Potentially fraudulent payment notification.

**Detection**: HMAC-SHA256 of webhook body does not match `X-Razorpay-Signature` header.

**Recovery**: Return 400, log the full request (minus sensitive headers) to audit trail with `event_type: 'webhook_signature_invalid'`. Do not update transaction state.

**Degradation**: Legitimate webhooks with corrupted signatures will not update order status; merchant dashboard will show the order as pending.

---

## Security Model

### Input Validation

Every API endpoint validates input using Zod schemas before processing:
- `CreateMerchantInputSchema` for merchant registration
- `CreateProductInputSchema` / `UpdateProductInputSchema` for catalog operations
- `CompiledRuleSchema` for rule engine entries
- `CreateAgentSessionSchema` for agent session creation
- `CreateAuditEventSchema` for audit log entries

Invalid input returns 400 with structured error details. No partial processing occurs.

### Trust Scoring

Agent trust is scored deterministically (see ADR-005). The score gates:
- **Maximum discount percentage**: higher trust = more negotiation room
- **Order value cap**: untrusted agents have lower per-order limits
- **Rate limit multiplier**: trusted agents get higher request quotas
- **Feature access**: some endpoints require minimum trust scores

### Rate Limiting

- Base limit: 20 requests per minute per agent session
- Trust-adjusted: trusted agents may get higher limits via merchant settings
- Violations reduce trust score by 15 points per incident
- Persistent violators hit the block threshold (20 points)

### Razorpay Key Management

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are stored as environment variables, never in the database
- Webhook signature verification uses `RAZORPAY_WEBHOOK_SECRET` with HMAC-SHA256
- Test keys (`rzp_test_*`) are used in development; live keys only in production
- The Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-side only and never exposed to the client

### Audit Trail

Every operation is logged to the `audit_log` table:
- `ai_involved`: boolean flag indicating if AI was part of the decision
- `ai_model`: which model was used (null if deterministic)
- `decision_reasoning`: human-readable explanation of why the action was taken
- `latency_ms`: performance tracking for every operation

The audit log is append-only. No UPDATE or DELETE operations are permitted on the `audit_log` table.

---

## Database Schema

Six tables in Supabase PostgreSQL:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `merchants` | Registered merchants | `id`, `agent_endpoint_slug`, `settings` |
| `catalog_products` | Product catalog with JSON-LD | `id`, `merchant_id`, `price`, `json_ld` |
| `commerce_rules` | NL rules + compiled engine rules | `id`, `natural_language`, `compiled_rule` |
| `agent_sessions` | Buyer-agent session tracking | `id`, `trust_score`, `spending_limit` |
| `transactions` | Order lifecycle tracking | `id`, `razorpay_order_id`, `status`, `items` |
| `audit_log` | Immutable event log | `id`, `ai_involved`, `ai_model`, `latency_ms` |

All tables use UUID primary keys and have `created_at` / `updated_at` timestamps.

---

## Deployment

Single Next.js deployment on Vercel (or any Node.js host):

```bash
npm run build    # Produces .next/ bundle
npm run start    # Starts production server
```

Environment variables must be set in the deployment platform. No build-time secrets are embedded.
