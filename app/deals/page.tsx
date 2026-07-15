import { searchDeals, getStores } from "@/lib/cheapshark";
import DealsBrowser from "@/components/DealsBrowser";

export const metadata = { title: "Deal Tracker — Loot Ledger" };
export const revalidate = 3600;

export default async function DealsPage() {
  let deals: Awaited<ReturnType<typeof searchDeals>> = [];
  let storeNames: Record<string, string> = {};
  let loadError = false;

  try {
    const [dealResults, stores] = await Promise.all([
      searchDeals({ pageSize: 20, sortBy: "Deal Rating" }),
      getStores(),
    ]);
    deals = dealResults;
    storeNames = Object.fromEntries(stores.map((s) => [s.storeID, s.storeName]));
  } catch (err) {
    console.error("Failed to load deals page data:", err);
    loadError = true;
  }

  return (
    <div>
      <h2 className="ll-display ll-page-title">Deal Tracker</h2>
      <p className="ll-muted ll-page-subtitle">Cheapest verified price across every major store, right now.</p>
      {loadError && (
        <p className="ll-muted">
          Live prices are temporarily unavailable — CheapShark may be down or rate-limiting. Try again shortly.
        </p>
      )}
      <DealsBrowser initialDeals={deals} storeNames={storeNames} />
    </div>
  );
}
