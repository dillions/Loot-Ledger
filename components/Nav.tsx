"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Gamepad2, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/tips", label: "Tips & Tricks" },
  { href: "/walkthroughs", label: "Walkthroughs" },
  { href: "/deals", label: "Deal Tracker" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="ll-header">
      <div className="ll-header-inner">
        <Link href="/" className="ll-brand">
          <Gamepad2 size={26} color="#F2A93B" />
          <span className="ll-display ll-brand-text">Loot Ledger</span>
        </Link>

        <nav className="ll-nav-desktop">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`ll-nav-btn ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="ll-nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="ll-nav-mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`ll-nav-btn ${pathname === item.href ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
