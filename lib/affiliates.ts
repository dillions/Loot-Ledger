import type { Deal } from "@/lib/itad";

// Per-store affiliate program membership (Epic Partner Program, Fanatical, GOG affiliate
// network, etc.) — populate as codes are obtained. Keyed by ITAD storeID.
const AFFILIATE_PARAMS: Record<string, Record<string, string>> = {
  // "61": { ref: "YOUR_EPIC_CODE" },
};

/**
 * Returns the outbound URL for a deal, applying this site's own affiliate tag
 * for that store if one has been configured. Passes the URL through unchanged
 * otherwise.
 */
export function buildOutboundUrl(deal: Pick<Deal, "url" | "storeID">): string {
  const params = AFFILIATE_PARAMS[deal.storeID];
  if (!params) return deal.url;
  const u = new URL(deal.url);
  for (const [key, value] of Object.entries(params)) {
    u.searchParams.set(key, value);
  }
  return u.toString();
}
