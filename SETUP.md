# MacroStake — Setup Guide

## Prerequisites
- Node.js 20+
- pnpm (`npm i -g pnpm`) or npm
- PostgreSQL database (local or hosted)
- Stripe account
- USDA FoodData Central API key (free at https://fdc.nal.usda.gov/api-key-signup.html)

---

## 1. Install dependencies

```bash
cd macrostake
npm install   # or pnpm install
```

---

## 2. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/web/.env.local`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID/SECRET` | Google Cloud Console → OAuth 2.0 |
| `GITHUB_CLIENT_ID/SECRET` | GitHub → Settings → Developer Apps |
| `USDA_API_KEY` | https://fdc.nal.usda.gov/api-key-signup.html |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Same as above |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | https://cloud.walletconnect.com |
| `CRON_SECRET` | Any random secret string |

---

## 3. Set up the database

```bash
cd packages/db
npx prisma generate      # generate client
npx prisma migrate dev   # create all tables
```

---

## 4. Run the web app

```bash
npm run dev
# → http://localhost:3000
```

### Stripe webhooks (local dev)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 5. Run the mobile app

```bash
cd apps/mobile
npx expo start
```

Set `EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000` in `apps/mobile/.env`.

---

## 6. Deploy (Vercel)

```bash
vercel --cwd apps/web
```

The `vercel.json` configures the midnight cron job (`/api/cron/process-penalties`) automatically.

Add all env vars in the Vercel dashboard. After deploy:
1. Update `NEXT_PUBLIC_APP_URL` to your production URL
2. Add the Stripe production webhook pointing to `https://yourdomain.com/api/stripe/webhook`

---

## Architecture

```
macrostake/
├── apps/
│   ├── web/          # Next.js 14 — landing page + web app + API
│   └── mobile/       # Expo React Native — iOS + Android
├── packages/
│   ├── db/           # Prisma schema + client (PostgreSQL)
│   └── types/        # Shared TypeScript types
└── turbo.json        # Turborepo monorepo config
```

## Key flows

### Penalty processing (runs at midnight via Vercel Cron)
1. `/api/cron/process-penalties` triggers
2. Fetches all users with a `PenaltyConfig`
3. Sums each user's food logs for yesterday
4. Calls `checkCompliance()` against their macro goals
5. If failed → `calculatePenalty()` → Stripe charge or crypto transfer
6. Marks the `DailySummary` as processed
7. If passed → increments streak, checks earn-back threshold

### Earn-back flow
1. User misses a day → penalty charged → streak reset to 0
2. User hits N consecutive on-track days → `Streak.completed = true`
3. Most recent `CHARGED` penalty is updated to `EARNED_BACK`
4. Stripe refund issued automatically

### Food search
- Queries USDA FoodData Central API (300k+ foods)
- Results cached in Next.js for 1 hour
- On first log, food is upserted into local DB for fast future access
- Macros computed per gram (`calcMacrosForGrams()`)
