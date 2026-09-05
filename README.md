# Arova

**The missing on-ramp for agentic commerce.**

> Razorpay AI Buildathon -- Track 01: Agentic Payments

Arova turns any Razorpay merchant into an agent-ready storefront. AI buyer agents can discover products, negotiate prices, and complete purchases through a structured API -- while every money operation stays deterministic, auditable, and Razorpay-native.

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd arova
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in the values (see Environment Variables below)

# 3. Seed the database
npx tsx scripts/generate-synthetic-data.ts --sql | psql $DATABASE_URL
# Or use the JSON output:
npx tsx scripts/generate-synthetic-data.ts --json

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the merchant dashboard.
Open [http://localhost:3000/demo](http://localhost:3000/demo) to run the buyer-agent simulator.

---

## Key Features

### 🤖 Buyer Agent Protocol
Complete 6-step protocol: **Discover → Query → Select → Negotiate → Checkout → Payment**

### 💰 Price Negotiation with Discounts
- Deterministic rule-based negotiation (no AI in pricing)
- Visual discount breakdown: Original Price → Discount % → Final Price
- Accept/Counter/Reject flows with reasoning
- Example: ₹4,999 → 10% off → ₹4,499 (Save ₹500)

### 🎨 Premium Fintech UI
- Cursor-reactive spotlight effects on cards
- Magnetic button interactions for CTAs
- Animated KPI number transitions
- Toast notifications for actions
- Full accessibility support (reduced motion, focus states)

### 📊 Full Audit Trail
Every action logged with:
- AI-involvement flags
- Model identifiers
- Decision reasoning
- Latency metrics

---

## Architecture Overview

```
Merchant Dashboard          AI Buyer Agent
       |                         |
       v                         v
  /api/merchant/*          /api/agent/:slug/*
       |                         |
       +----------+--------------+
                  |
            Rule Engine          (deterministic -- no AI)
                  |
         +--------+--------+
         |                  |
    AI Layer            Razorpay SDK
  (Gemini/Groq)       (orders, payments)
         |                  |
         +--------+---------+
                  |
            Supabase DB
   (merchants, products, rules,
    sessions, transactions, audit)
```

The system is **80% deterministic** (rule evaluation, pricing math, Razorpay API calls) and **20% AI** (semantic search, catalog generation, natural-language rule compilation, buyer-agent reasoning). Money operations are never AI-driven.

---

## API Endpoints

### Merchant APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/merchant/catalog` | Add/update products in the catalog |
| GET | `/api/merchant/catalog` | List merchant products |
| POST | `/api/merchant/catalog-generate` | AI-generate catalog from description |
| POST | `/api/merchant/rules` | Create commerce rules (plain text) |
| GET | `/api/merchant/rules` | List active rules |
| POST | `/api/merchant/rules-compile` | AI-compile NL rules to engine format |

### Agent Gateway APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/discover` | Semantic product search |
| POST | `/api/agent/query` | Structured product queries |
| POST | `/api/agent/negotiate` | Price negotiation (rule-bound) |
| POST | `/api/agent/checkout` | Create order + Razorpay payment link |
| GET | `/api/agent/status` | Check order/payment status |

### Razorpay Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/razorpay/create-order` | Create Razorpay order |
| POST | `/api/razorpay/verify-payment` | Verify payment signature |
| POST | `/api/razorpay/webhook` | Razorpay webhook receiver |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | Query audit log |
| POST | `/api/simulator/run` | Run end-to-end buyer-agent simulation |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React with API routes |
| Language | TypeScript (strict) | Type safety across the stack |
| Styling | Tailwind CSS 4 | Utility-first dark-theme UI |
| Database | Supabase PostgreSQL | 6-table schema with RLS |
| Payments | Razorpay SDK | Orders, payments, webhooks |
| AI (Context) | Google Gemini Flash | 1M-token context for catalog/rules |
| AI (Speed) | Groq Llama 3.3 70B | Low-latency buyer-agent reasoning |
| Validation | Zod 4 | Runtime schema validation |

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# AI
GEMINI_API_KEY=...
GROQ_API_KEY=gsk_...
```

---

## Demo Instructions

### 1. Merchant Setup

1. Start the dev server (`npm run dev`)
2. Open the dashboard at `/dashboard`
3. Products and rules are pre-seeded via the seed script

### 2. Buyer-Agent Simulation

1. Navigate to `/demo`
2. The simulator runs a full agent session:
   - **Discover**: agent searches for products using natural language
   - **Negotiate**: agent attempts to negotiate price within rule bounds
   - **Checkout**: agent creates a Razorpay order
   - **Verify**: payment confirmation closes the loop
3. Every step is logged to the audit trail with AI-involvement flags

### 3. API Testing

Use the agent gateway directly:

```bash
# Discover products
curl -X POST http://localhost:3000/api/agent/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "running shoes under 2000", "slug": "sportkart"}'

# Negotiate price
curl -X POST http://localhost:3000/api/agent/negotiate \
  -H "Content-Type: application/json" \
  -d '{"session_id": "...", "product_id": "...", "proposed_price": 1100}'
```

---

## Project Structure

```
src/
  app/
    api/
      agent/         # Buyer-agent gateway endpoints
      merchant/      # Merchant management endpoints
      razorpay/      # Payment integration endpoints
      audit/         # Audit log query endpoint
      simulator/     # End-to-end simulation runner
    dashboard/       # Merchant dashboard UI
    demo/            # Buyer-agent demo UI
  lib/
    ai/              # Gemini & Groq clients, semantic search
    engine/          # Deterministic rule engine, trust scorer
    razorpay/        # Razorpay SDK wrapper
    supabase/        # Database clients
    utils/           # Constants, errors, Schema.org helpers
  types/             # Shared TypeScript interfaces & Zod schemas
scripts/
  generate-synthetic-data.ts   # Seed data generator
```

---

## Demo Script

### Test Price Negotiation
1. Go to `/demo`
2. Type: "running shoes under 5000"
3. Watch the agent:
   - Find ProStride shoes (₹4,999)
   - Propose discount (₹4,499)
   - System accepts (10% off)
   - Shows breakdown with savings

### View Dashboard
1. Go to `/dashboard`
2. See KPIs with AI/Deterministic split
3. Check recent activity with latency metrics
4. Navigate to Catalog, Rules, Audit pages

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Quick Deploy to Vercel:**
```bash
npm i -g vercel
vercel --prod
```

Then add environment variables in Vercel dashboard.

---

## License

Built for the Razorpay AI Buildathon. All rights reserved.
