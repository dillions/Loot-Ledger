import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { tier } = (await req.json()) as { tier?: string };
  const priceId = tier ? STRIPE_PRICE_IDS[tier] : undefined;

  if (!priceId) {
    return NextResponse.json(
      { error: "That tier isn't configured yet — add its Stripe price ID as an env var (see README)." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pricing?success=true`,
      cancel_url: `${siteUrl}/pricing?canceled=true`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session failed:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
