// Thin client for the IsThereAnyDeal (ITAD) API.
// Docs: https://docs.isthereanydeal.com/
// Register a free app at https://isthereanydeal.com/apps/my/ to get ITAD_API_KEY.

const ITAD_BASE = "https://api.isthereanydeal.com";
const apiKey = process.env.ITAD_API_KEY;

export type Deal = {
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  storeID: string;
  url: string;
};

export type Store = {
  storeID: string;
  storeName: string;
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

// ITAD sort values: a bare field name sorts ascending, a "-" prefix sorts descending.
const SORT_MAP: Record<NonNullable<DealSearchParams["sortBy"]>, string> = {
  "Deal Rating": "-cut",
  Title: "title",
  Savings: "-cut",
  Price: "price",
  Metacritic: "-cut",
  Reviews: "-cut",
  Release: "-cut",
  Recent: "-time",
};

function itadHeaders(withJsonBody = false): HeadersInit {
  if (!apiKey) {
    throw new Error("ITAD_API_KEY is not set");
  }
  return withJsonBody
    ? { "ITAD-API-Key": apiKey, "Content-Type": "application/json" }
    : { "ITAD-API-Key": apiKey };
}

type ItadShop = { id: number; name: string };
type ItadMoney = { amount: number; amountInt: number; currency: string };
type ItadDealEntry = {
  shop: ItadShop;
  price: ItadMoney;
  regular: ItadMoney;
  cut: number;
  url: string;
};

function toDeal(gameId: string, title: string, entry: ItadDealEntry): Deal {
  return {
    dealID: `${gameId}-${entry.shop.id}`,
    title,
    salePrice: entry.price.amount.toFixed(2),
    normalPrice: entry.regular.amount.toFixed(2),
    savings: String(entry.cut),
    storeID: String(entry.shop.id),
    url: entry.url,
  };
}

let storeCache: { data: Store[]; fetchedAt: number } | null = null;
const STORE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // stores rarely change, cache for a day

/**
 * Returns every storefront ITAD tracks (Steam, GOG, Epic, Fanatical, etc).
 * Cached in-memory for the life of the server process to avoid refetching on every request.
 */
export async function getStores(): Promise<Store[]> {
  if (storeCache && Date.now() - storeCache.fetchedAt < STORE_CACHE_TTL_MS) {
    return storeCache.data;
  }
  const res = await fetch(`${ITAD_BASE}/service/shops/v1`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`ITAD /service/shops/v1 request failed: ${res.status}`);
  }
  const shops: { id: number; title: string }[] = await res.json();
  const data = shops.map((s) => ({ storeID: String(s.id), storeName: s.title }));
  storeCache = { data, fetchedAt: Date.now() };
  return data;
}

async function browseDeals(params: DealSearchParams): Promise<Deal[]> {
  const search = new URLSearchParams();
  search.set("country", "US");
  search.set("limit", String(Math.min(params.pageSize ?? 20, 60)));
  search.set("offset", String((params.pageNumber ?? 0) * (params.pageSize ?? 20)));
  search.set("sort", SORT_MAP[params.sortBy ?? "Deal Rating"]);
  if (params.storeID) search.set("shops", params.storeID);

  const res = await fetch(`${ITAD_BASE}/deals/v2?${search.toString()}`, {
    method: "GET",
    headers: itadHeaders(false),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`ITAD /deals/v2 request failed: ${res.status}`);
  }
  const body: { list: { id: string; title: string; deal: ItadDealEntry }[] } = await res.json();
  const list = body.list ?? [];
  return list
    .filter(
      (d) =>
        (params.upperPrice == null || d.deal.price.amount <= params.upperPrice) &&
        (params.lowerPrice == null || d.deal.price.amount >= params.lowerPrice)
    )
    .map((d) => toDeal(d.id, d.title, d.deal));
}

async function searchByTitle(params: DealSearchParams): Promise<Deal[]> {
  const searchRes = await fetch(
    `${ITAD_BASE}/games/search/v1?title=${encodeURIComponent(params.title!)}&results=10`,
    { headers: itadHeaders(false), next: { revalidate: 3600 } }
  );
  if (!searchRes.ok) {
    throw new Error(`ITAD /games/search/v1 request failed: ${searchRes.status}`);
  }
  const games: { id: string; title: string }[] = await searchRes.json();
  if (games.length === 0) return [];

  // No `deals: "true"` filter here — search needs to surface every matched game
  // (even at full price) so it can be added to a wishlist, not just discounted ones.
  const pricesSearch = new URLSearchParams({ country: "US" });
  if (params.storeID) pricesSearch.set("shops", params.storeID);

  const pricesRes = await fetch(`${ITAD_BASE}/games/prices/v3?${pricesSearch.toString()}`, {
    method: "POST",
    headers: itadHeaders(true),
    body: JSON.stringify(games.map((g) => g.id)),
    next: { revalidate: 3600 },
  });
  if (!pricesRes.ok) {
    throw new Error(`ITAD /games/prices/v3 request failed: ${pricesRes.status}`);
  }
  const priceResults: { id: string; deals: ItadDealEntry[] }[] = await pricesRes.json();
  const titleById = new Map(games.map((g) => [g.id, g.title]));

  const deals = priceResults.flatMap((r) =>
    (r.deals ?? [])
      .filter((d) => (params.upperPrice == null || d.price.amount <= params.upperPrice) && (params.lowerPrice == null || d.price.amount >= params.lowerPrice))
      .map((d) => toDeal(r.id, titleById.get(r.id) ?? "", d))
  );
  return deals.slice(0, params.pageSize ?? 20);
}

/**
 * Searches active deals across every store ITAD tracks.
 * Without a title, browses current deals sorted by ITAD's discount ranking.
 * With a title, resolves matching games first, then fetches their current deals.
 */
export async function searchDeals(params: DealSearchParams = {}): Promise<Deal[]> {
  return params.title ? searchByTitle(params) : browseDeals(params);
}

export function formatSavings(savings: string): number {
  return Math.round(parseFloat(savings));
}
