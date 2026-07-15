import { Check } from "lucide-react";
import { TIERS } from "@/lib/content";
import SubscribeButton from "@/components/SubscribeButton";

export const metadata = { title: "Pricing — Loot Ledger" };

export default function PricingPage() {
  return (
    <div>
      <h2 className="ll-display ll-page-title">Pick your edition</h2>
      <p className="ll-muted ll-page-subtitle">Cancel anytime. Prices in USD.</p>
      <div className="ll-tiers-grid">
        {TIERS.map((tier) => (
          <div key={tier.id} className={`ll-card ll-tier ${tier.highlight ? "highlight" : ""}`}>
            {tier.highlight && (
              <span className="ll-sticky-tab ll-tier-badge" style={{ background: "#F2A93B", color: "#1B1B1F" }}>
                Most popular
              </span>
            )}
            <h3 className="ll-display ll-tier-name">{tier.name}</h3>
            <p className="ll-tier-tagline">{tier.tagline}</p>
            <div className="ll-mono ll-tier-price">
              ${tier.price}
              <span className="ll-tier-period">/mo</span>
            </div>
            <ul className="ll-tier-features">
              {tier.features.map((f) => (
                <li key={f} className="ll-tier-feature">
                  <Check size={16} className="ll-tier-check" color="#2D5D4F" />
                  {f}
                </li>
              ))}
            </ul>
            <SubscribeButton
              tierId={tier.id}
              label={tier.price === 0 ? "Start free" : "Subscribe"}
              highlight={tier.highlight}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
