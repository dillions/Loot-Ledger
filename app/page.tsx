import Link from "next/link";
import { TrendingDown, Flame, BookOpen } from "lucide-react";
import { searchDeals, getStores } from "@/lib/cheapshark";
import PriceTag from "@/components/PriceTag";

export const revalidate = 3600; // refresh featured deals hourly

export default async function HomePage() {
  let featuredDeals: Awaited<ReturnType<typeof searchDeals>> = [];
  let storeNames: Record<string, string> = {};

  try {
    const [deals, stores] = await Promise.all([
      searchDeals({ pageSize: 3, sortBy: "Deal Rating" }),
      getStores(),
    ]);
    featuredDeals = deals;
    storeNames = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));
  } catch (err) {
    // CheapShark can occasionally be slow/unavailable — the page should still render.
    console.error("Failed to load featured deals:", err);
  }

  return (
    <div>
      <section className="ll-hero">
        <div>
          <span className="ll-sticky-tab">Updated every patch day</span>
          <h1 className="ll-display ll-hero-title">
            Every cheat sheet.
            <br />
            Every price drop.
            <br />
            <span className="ll-highlighter">One membership.</span>
          </h1>
          <p className="ll-hero-copy">
            Loot Ledger tracks prices across 30+ stores and keeps the meta reports, boss guides, and
            build sheets current the day a patch lands — not three weeks later.
          </p>
          <div className="ll-hero-actions">
            <Link href="/pricing" className="ll-btn-primary">
              See membership tiers
            </Link>
            <Link href="/deals" className="ll-btn-secondary">
              Check today&apos;s deals
            </Link>
          </div>
        </div>
        <div className="ll-hero-tags">
          {featuredDeals.map((d) => (
            <div key={d.dealID} className="ll-hero-tag-item">
              <span className="ll-mono ll-hero-tag-label">{d.title}</span>
              <PriceTag deal={d} storeName={storeNames[d.storeID]} />
            </div>
          ))}
          {featuredDeals.length === 0 && (
            <p className="ll-muted">Live deals will show here once CheapShark responds.</p>
          )}
        </div>
      </section>

      <section className="ll-features">
        <div className="ll-card">
          <TrendingDown className="ll-feature-icon" />
          <h3 className="ll-display ll-feature-title">Deal Tracker</h3>
          <p className="ll-feature-copy">
            Live price comparisons across Steam, Epic, GOG, Fanatical and more — plus wishlist alerts
            the moment a game hits its 90-day low.
          </p>
        </div>
        <div className="ll-card">
          <Flame className="ll-feature-icon" />
          <h3 className="ll-display ll-feature-title">Tips & Meta Reports</h3>
          <p className="ll-feature-copy">
            Loadouts, rotations, and settings for the live-service games people actually keep playing —
            rewritten the day a balance patch drops.
          </p>
        </div>
        <div className="ll-card">
          <BookOpen className="ll-feature-icon" />
          <h3 className="ll-display ll-feature-title">Full Walkthroughs</h3>
          <p className="ll-feature-copy">
            Step-by-step story guides for this year&apos;s big single-player releases, every ending and
            every collectible mapped.
          </p>
        </div>
      </section>
    </div>
  );
}
