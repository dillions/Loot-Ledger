import { TIPS } from "@/lib/content";

export const metadata = { title: "Tips & Tricks — Loot Ledger" };

export default function TipsPage() {
  return (
    <div>
      <h2 className="ll-display ll-page-title">Tips & Tricks</h2>
      <p className="ll-muted ll-page-subtitle">Rewritten every time the meta shifts.</p>
      <div className="ll-tips-grid">
        {TIPS.map((t) => (
          <div key={t.id} className="ll-card">
            <span className="ll-sticky-tab">{t.tag}</span>
            <h3 className="ll-display ll-tip-title">{t.title}</h3>
            <p className="ll-mono ll-tip-game">{t.game}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
