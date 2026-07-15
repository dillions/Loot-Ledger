import { WALKTHROUGHS } from "@/lib/content";

export const metadata = { title: "Walkthroughs — Loot Ledger" };

export default function WalkthroughsPage() {
  return (
    <div>
      <h2 className="ll-display ll-page-title">Walkthroughs</h2>
      <p className="ll-muted ll-page-subtitle">Every step, every ending, no filler.</p>
      <div className="ll-walkthrough-list">
        {WALKTHROUGHS.map((w, i) => (
          <div key={w.id} className="ll-card ll-walkthrough-item">
            <span className="ll-display ll-walkthrough-index">{String(i + 1).padStart(2, "0")}</span>
            <div className="ll-walkthrough-body">
              <h3 className="ll-display ll-walkthrough-game">{w.game}</h3>
              <p className="ll-walkthrough-chapter">{w.chapter}</p>
            </div>
            <span className="ll-mono ll-walkthrough-steps">{w.steps} steps</span>
          </div>
        ))}
      </div>
    </div>
  );
}
