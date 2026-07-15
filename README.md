# Loot Ledger

A Next.js starter for a gaming tips/walkthroughs/deal-tracking subscription site.

## What's actually real here

- **Deal Tracker** — pulls live prices from the [CheapShark API](https://apidocs.cheapshark.com/) (free, no key needed). Search, wishlist toggling (client-side only right now), and store names are all working against real data.
- **Pricing page** — the Subscribe buttons create a real [Stripe Checkout](https://stripe.com/docs/payments/checkout) session once you add your own Stripe keys and price IDs (see below). Until you do, clicking Subscribe will show a friendly error instead of failing silently.
- **Tips & Walkthroughs pages** — currently static content in `lib/content.ts` so you have something to launch with. Swap this for a real CMS once you have writers (see Phase 2 below).

## What's not built yet (on purpose)

Shipping this as an MVP first, then adding weight, is deliberate — see the "Phase 1/2/3" reasoning in the build plan doc. Specifically **not** included yet:

- User accounts / login (Stripe Checkout currently works email-only, no gating of content behind a real session)
- A database (nothing persists between requests — wishlists reset on refresh)
- The CMS integration for tips/walkthroughs
- Console price tracking (PlayStation/Xbox/Nintendo don't have a free unified API like CheapShark)

These are Phase 2 in the build plan — adding them means picking an auth provider (Supabase Auth or Clerk are the easiest) and a database (Supabase/Neon Postgres), then gating the `/deals` wishlist and `/walkthroughs` full content behind a signed-in + subscribed check.

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local — see "Setting up Stripe" below
npm run dev
```

Visit `http://localhost:3000`. The Deal Tracker and home page will show live prices immediately — no keys required for that part.

## Setting up Stripe

1. Create a free account at [stripe.com](https://stripe.com) if you don't have one.
2. Dashboard → Developers → API keys → copy your **test** secret key into `STRIPE_SECRET_KEY`.
3. Dashboard → Product catalog → create two products: "Player's Guide" ($6.99/mo recurring) and "Completionist" ($12.99/mo recurring).
4. Each product's price has an ID starting with `price_...` — copy those into `STRIPE_PRICE_PLAYERS_GUIDE` and `STRIPE_PRICE_COMPLETIONIST`.
5. Switch to live keys the same way once you're ready to charge real cards.

## Deploying

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com) → New Project → import that repo. Vercel auto-detects Next.js, no config needed.
3. In the Vercel project's Settings → Environment Variables, add the same variables from `.env.local`, using your real deployed URL for `NEXT_PUBLIC_SITE_URL`.
4. Deploy. Add a custom domain under Settings → Domains once you own one.

## Project structure

```
app/
  page.tsx              home page (server-rendered, live featured deals)
  tips/page.tsx          tips & tricks
  walkthroughs/page.tsx  walkthroughs
  deals/page.tsx         deal tracker (server fetch + client search/wishlist)
  pricing/page.tsx        subscription tiers + Stripe checkout
  api/deals/route.ts      proxies CheapShark search so the client can re-query
  api/checkout/route.ts   creates a Stripe Checkout session
lib/
  cheapshark.ts          CheapShark API client
  stripe.ts              Stripe client
  content.ts             static tips/walkthroughs/tiers content
components/
  Nav.tsx, PriceTag.tsx, DealsBrowser.tsx, SubscribeButton.tsx
```

## Ads

TikTok/Meta ad campaigns aren't something that gets "deployed" from this codebase — they're built directly in TikTok Ads Manager and Meta Ads Manager using the scripts and creative direction in the build plan doc. Nothing to install here for that part.

## Keeping it current (daily auto-updates)

Two different things get "updated daily," and they work differently:

**Prices — fully automatic, no bot to babysit.** The deal tracker re-fetches from CheapShark on the server every hour (ISR), and `vercel.json` adds a daily cron (`/api/cron/refresh` at 06:00 UTC) that force-refreshes the home and deals pages so they're guaranteed current every morning. Once deployed, this runs itself. Set a `CRON_SECRET` env var (any long random string) so only Vercel can trigger it.

**Editorial content (tips / meta notes) — optional, review-gated.** `scripts/generate-content-drafts.mjs` uses the Anthropic API (with web search) to draft "what changed this week" notes per game and writes them to `./drafts/` for you to skim before publishing. It deliberately does **not** auto-publish: Google penalizes sites that mass-publish unreviewed AI content, and one wrong detail in a guide costs more trust than it's worth. Run it on a schedule (a GitHub Action works well) and spend a minute approving drafts. Walkthroughs, by contrast, don't need daily updates — they're written once per game.
