import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loot Ledger — Tips, Walkthroughs & the Cheapest Prices",
  description:
    "Meta reports and walkthroughs for the games people actually keep playing, plus real-time price tracking across every major store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="ll-main">{children}</main>
        <footer className="ll-footer">
          <span className="ll-mono">Loot Ledger</span>
          <span>Price data refreshed hourly via CheapShark</span>
        </footer>
      </body>
    </html>
  );
}
