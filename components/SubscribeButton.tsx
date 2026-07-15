"use client";

import { useState } from "react";

export default function SubscribeButton({
  tierId,
  label,
  highlight,
}: {
  tierId: string;
  label: string;
  highlight?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (tierId === "free") {
      window.location.href = "/deals";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout isn't set up yet — see the README.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="ll-tier-btn"
      style={{ background: highlight ? "#F2A93B" : "#1B1B1F", color: highlight ? "#1B1B1F" : "#FBF6EC" }}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
