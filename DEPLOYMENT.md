# Arova Deployment Guide

## Quick Deploy (5 Minutes)

### Prerequisites
- GitHub account
- Vercel account (free)
- Environment variables ready

---

## Method 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd arova

# Deploy
vercel --prod

# Add environment variables when prompted (copy from .env.local)
```

Your app will be live at: `https://arova-xxx.vercel.app`

---

## Method 2: GitHub + Vercel Dashboard (Recommended)

Vercel is built by the Next.js team and offers zero-config deployment.

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Environment variables ready (see below)

### Step 1: Push Code to GitHub

```bash
# If not already initialized
cd E:/New\ folder/arova
git add .
git commit -m "Production-ready: Premium UI with interaction enhancements"

# Create GitHub repo and push
# Option A: Via GitHub CLI
gh repo create arova --public --source=. --remote=origin --push

# Option B: Via GitHub web
# 1. Create repo at https://github.com/new
# 2. Add remote and push:
git remote add origin https://github.com/YOUR_USERNAME/arova.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
4. Add environment variables (see below)
5. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

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

**Important:** Add these to all environments (Production, Preview, Development) or just Production for now.

### Step 4: Redeploy

After adding env vars:
```bash
vercel --prod
```

Or click "Redeploy" in Vercel Dashboard.

### Your live URL
```
https://arova.vercel.app
```

---

## Alternative: Railway

Railway offers $5/month free credits and PostgreSQL hosting.

### Deploy
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL="..."
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
# ... add all env vars

# Deploy
railway up
```

---

## Alternative: Render

Free tier with slower cold starts.

### Deploy
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
5. Add environment variables
6. Deploy

---

## Alternative: DigitalOcean App Platform

$5/month, good performance.

1. Go to https://cloud.digitalocean.com/apps
2. Create App → GitHub
3. Select repository
4. Configure:
   - Type: Web Service
   - Build Command: `npm run build`
   - Run Command: `npm start`
5. Add environment variables
6. Deploy

---

## Production Checklist

### Database (Supabase)
- [ ] Supabase project created
- [ ] All migrations applied (`supabase/migrations/*.sql`)
- [ ] Seed data loaded (`supabase/seed.sql`)
- [ ] RLS policies enabled (if needed)
- [ ] Connection pooling enabled for production load

### API Keys
- [ ] Razorpay Test Keys work
- [ ] Switch to Razorpay Live Keys for production (after testing)
- [ ] Gemini API key has sufficient quota
- [ ] Groq API key has sufficient quota
- [ ] All keys stored as environment variables (not in code)

### Security
- [ ] RAZORPAY_WEBHOOK_SECRET configured
- [ ] SUPABASE_SERVICE_ROLE_KEY not exposed to client
- [ ] CORS configured properly (if needed)
- [ ] Rate limiting enabled (Vercel does this automatically)

### Testing
- [ ] Test landing page: `https://your-app.vercel.app`
- [ ] Test dashboard: `https://your-app.vercel.app/dashboard`
- [ ] Test demo: `https://your-app.vercel.app/demo`
- [ ] Test product catalog API
- [ ] Test rule compilation
- [ ] Run buyer agent simulation end-to-end

### Performance
- [ ] Images optimized (using Next.js Image component where applicable)
- [ ] Bundle size reasonable (`npm run build` output < 1MB)
- [ ] No console errors in production
- [ ] Lighthouse score > 90 (run in incognito)

### Buildathon Specific
- [ ] Demo data seeded
- [ ] Test merchant account set up (SportKart India)
- [ ] Sample products with AI-generated descriptions
- [ ] Sample commerce rules compiled
- [ ] Buyer agent simulation works end-to-end
- [ ] Audit trail shows AI/Deterministic split

---

## Troubleshooting

### Build fails with "Module not found"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment variables not working
- Ensure they start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding env vars
- Check Vercel logs: `vercel logs`

### Supabase connection fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://xxx.supabase.co`
- Verify anon key starts with `eyJ`
- Check Supabase project is not paused (free tier pauses after inactivity)

### Razorpay webhook not working
- Configure webhook URL in Razorpay Dashboard:
  - URL: `https://your-app.vercel.app/api/razorpay/webhook`
  - Events: `payment.authorized`, `payment.captured`, `payment.failed`
- Verify `RAZORPAY_WEBHOOK_SECRET` matches

### Build takes too long
- Check for circular dependencies
- Reduce bundle size by lazy-loading heavy components
- Consider increasing Vercel timeout (Pro plan)

---

## Monitoring

### Vercel Analytics (Free)
Automatically enabled. View at:
```
https://vercel.com/your-username/arova/analytics
```

### Supabase Logs
View database logs at:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/logs/postgres-logs
```

### Razorpay Dashboard
Monitor transactions at:
```
https://dashboard.razorpay.com/app/dashboard
```

---

## Custom Domain (Optional)

### Add to Vercel
1. Go to Project Settings → Domains
2. Add domain: `arova.yourdomain.com`
3. Configure DNS:
   - Type: CNAME
   - Name: `arova`
   - Value: `cname.vercel-dns.com`
4. Wait for propagation (up to 24h, usually < 1h)

---

## Cost Estimates

### Free Tier (Sufficient for Hackathon)
- **Vercel:** Free (Hobby tier)
  - 100GB bandwidth/month
  - Unlimited deployments
- **Supabase:** Free
  - 500MB database
  - 2GB bandwidth
  - 50,000 monthly active users
- **Gemini API:** Free tier (60 requests/min)
- **Groq API:** Free tier (30 requests/min)
- **Razorpay:** Test mode (free)

**Total: $0/month** for demo/hackathon

### Production Scale
- **Vercel Pro:** $20/month (better performance, analytics)
- **Supabase Pro:** $25/month (8GB database, daily backups)
- **Gemini API:** Pay per token (~$7/1M tokens)
- **Groq API:** Free tier sufficient for moderate traffic
- **Razorpay:** 2% transaction fee (live mode)

**Estimated: $45-100/month** depending on traffic

---

## Post-Deployment

### Share Demo URL
```
🚀 Arova Demo: https://arova.vercel.app
📊 Dashboard: https://arova.vercel.app/dashboard
🤖 Live Simulation: https://arova.vercel.app/demo

Built for Razorpay AI Buildathon - Track 01: Agentic Payments
```

### GitHub README Badge
Add to README.md:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/arova)
```

### Demo Script for Judges
1. **Landing Page** - Show value prop and 6-step protocol
2. **Dashboard** - KPIs with AI/Deterministic split
3. **Catalog** - Generate AI description for a product
4. **Rules** - Show compiled rules (if any)
5. **Demo** - Run full buyer agent simulation
6. **Audit Trail** - Show logged events with latency

---

## Rollback (If Needed)

```bash
# Via CLI
vercel rollback

# Via Dashboard
# Go to Deployments → Select previous deployment → Promote to Production
```

---

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs
