"use client";

import { useState } from "react";
import { Search, Heart } from "lucide-react";
import type { Deal } from "@/lib/itad";
import PriceTag from "./PriceTag";

export default function DealsBrowser({
  initialDeals,
  storeNames,
}: {
  initialDeals: Deal[];
  storeNames: Record<string, string>;
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  async function runSearch(next: string) {
    setQuery(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/deals?title=${encodeURIComponent(next)}`);
      const data = await res.json();
      if (Array.isArray(data.deals)) setDeals(data.deals);
    } catch (err) {
      console.error("Deal search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="ll-search">
        <Search size={18} className="ll-search-icon" />
        <input
          className="ll-search-input"
          placeholder="Search a game..."
          value={query}
          onChange={(e) => runSearch(e.target.value)}
        />
      </div>

      {loading && <p className="ll-muted">Fetching live prices...</p>}

      <div className="ll-deals-grid">
        {deals.map((d) => (
          <div key={d.dealID} className="ll-card ll-deal-card">
            <div>
              <h3 className="ll-display ll-deal-title">{d.title}</h3>
              <button className="ll-wishlist-btn" onClick={() => toggleWishlist(d.dealID)}>
                <Heart size={14} fill={wishlist.has(d.dealID) ? "#C1443A" : "none"} color="#C1443A" />
                {wishlist.has(d.dealID) ? "On your wishlist" : "Add to wishlist"}
              </button>
            </div>
            <PriceTag deal={d} storeName={storeNames[d.storeID]} />
          </div>
        ))}
        {deals.length === 0 && !loading && <p className="ll-muted">No games match that search.</p>}
      </div>
    </div>
  );
}
