// Thin client for the CheapShark public API (no API key required).
// Docs: https://apidocs.cheapshark.com/

const CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0";

export type Deal = {
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string; // percentage, as a string like "39.996000"
  storeID: string;
  gameID: string;
  steamRatingPercent?: string;
  steamRatingText?: string;
  metacriticScore?: string;
  releaseDate?: number;
  lastChange?: number;
  dealRating?: string;
  thumb?: string;
};

export type Store = {
  storeID: string;
  storeName: string;
  isActive: number;
  images: { banner: string; logo: string; icon: string };
};

export type DealSearchParams = {
  title?: string;
  upperPrice?: number;
  lowerPrice?: number;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: "Deal Rating" | "Title" | "Savings" | "Price" | "Metacritic" | "Reviews" | "Release" | "Recent";
  storeID?: string;
};

let storeCache: { data: Store[]; fetchedAt: number } | null = null;
const STORE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // stores rarely change, cache for a day

/**
 * Returns every storefront CheapShark tracks (Steam, GOG, Epic, Fanatical, etc).
 * Cached in-memory for the life of the server process to avoid refetching on every request.
 */
export async function getStores(): Promise<Store[]> {
  if (storeCache && Date.now() - storeCache.fetchedAt < STORE_CACHE_TTL_MS) {
    return storeCache.data;
  }
  const res = await fetch(`${CHEAPSHARK_BASE}/stores`, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`CheapShark /stores request failed: ${res.status}`);
  }
  const data: Store[] = await res.json();
  storeCache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Searches active deals across every store CheapShark tracks.
 * Defaults to on-sale-only items sorted by CheapShark's own "Deal Rating" quality score.
 */
export async function searchDeals(params: DealSearchParams = {}): Promise<Deal[]> {
  const search = new URLSearchParams();
  if (params.title) search.set("title", params.title);
  if (params.upperPrice != null) search.set("upperPrice", String(params.upperPrice));
  if (params.lowerPrice != null) search.set("lowerPrice", String(params.lowerPrice));
  if (params.storeID) search.set("storeID", params.storeID);
  search.set("pageNumber", String(params.pageNumber ?? 0));
  search.set("pageSize", String(Math.min(params.pageSize ?? 20, 60)));
  search.set("sortBy", params.sortBy ?? "Deal Rating");
  search.set("onSale", "1");

  const res = await fetch(`${CHEAPSHARK_BASE}/deals?${search.toString()}`, {
    // Revalidate hourly — deal prices don't need to be fetched on every single request.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`CheapShark /deals request failed: ${res.status}`);
  }
  return res.json();
}

export function formatSavings(savings: string): number {
  return Math.round(parseFloat(savings));
}
