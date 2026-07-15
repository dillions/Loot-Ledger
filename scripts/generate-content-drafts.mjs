/**
 * OPTIONAL content-draft generator.
 *
 * Run this on a schedule (locally, or via a GitHub Action) to have an LLM draft
 * refreshed tips / meta notes for your games. It writes DRAFTS to ./drafts/ for a
 * human to review — it does NOT auto-publish to the live site, on purpose.
 *
 * Why review-gated: search engines (Google's "scaled content abuse" policy)
 * actively penalize sites that mass-publish unreviewed AI content, and a
 * walkthrough or meta report with a wrong detail is worse for trust than none.
 * A person skimming each draft for 60 seconds before it goes live keeps the
 * daily-fresh benefit without the SEO and credibility risk.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-content-drafts.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const GAMES = [
  "Valorant",
  "Fortnite",
  "Counter-Strike 2",
  "League of Legends",
  "Call of Duty: Warzone",
];

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("Set ANTHROPIC_API_KEY before running.");
  process.exit(1);
}

async function draftForGame(game) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      // Web search lets the draft reflect the current patch, not stale training data.
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Write a short, accurate "what changed this week" meta note for ${game}. ` +
            `Search for the most recent patch or balance update first. Keep it to 120 words, ` +
            `plain text, no fluff. If you can't confirm a recent change, say so instead of inventing one.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`API error for ${game}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  return data.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const outDir = join(process.cwd(), "drafts");
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);

  for (const game of GAMES) {
    console.log(`Drafting: ${game}...`);
    const text = await draftForGame(game);
    if (!text) continue;
    const slug = game.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await writeFile(join(outDir, `${stamp}-${slug}.md`), text, "utf-8");
  }

  console.log(`\nDrafts written to ./drafts/ — review, then paste approved ones into lib/content.ts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
