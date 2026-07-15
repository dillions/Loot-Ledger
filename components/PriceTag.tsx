"use client";

import { useState } from "react";
import type { Deal } from "@/lib/cheapshark";
import { formatSavings } from "@/lib/cheapshark";

export default function PriceTag({ deal, storeName }: { deal: Deal; storeName?: string }) {
  const [hover, setHover] = useState(false);
  const rotate = parseInt(deal.dealID.slice(-1), 36) % 2 === 0 ? "-1.5deg" : "1.5deg";
  const savingsPct = formatSavings(deal.savings);

  return (
    <div
      className="ll-tag-wrap"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transform: hover ? "rotate(0deg)" : `rotate(${rotate})` }}
    >
      <div className="ll-tag">
        <div className="ll-tag-hole" />
        <div className="ll-mono ll-tag-price">${deal.salePrice}</div>
        <div className="ll-tag-list ll-mono">${deal.normalPrice}</div>
      </div>
      <div className="ll-tag-meta">
        {savingsPct > 0 && <span className="ll-mono ll-tag-discount">-{savingsPct}%</span>}
        {storeName && <span className="ll-tag-store">{storeName}</span>}
      </div>
    </div>
  );
}
