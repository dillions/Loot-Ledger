import Stripe from "stripe";

// STRIPE_SECRET_KEY comes from your Stripe dashboard (Developers → API keys).
// Checkout will throw at request time, not at build time, if this is missing —
// see the README for how to set it in .env.local and in Vercel's project settings.
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(secretKey ?? "sk_missing_key", {
  apiVersion: "2024-06-20",
});

export const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  "players-guide": process.env.STRIPE_PRICE_PLAYERS_GUIDE,
  completionist: process.env.STRIPE_PRICE_COMPLETIONIST,
};
