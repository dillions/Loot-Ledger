// Static launch content. Once you have more than one or two writers,
// swap this for a real CMS (Sanity, Contentful) — see README "Phase 2".

export const TIPS = [
  { id: 1, game: "Valorant", title: "Dial in your crosshair before the Ranked reset", tag: "Meta" },
  { id: 2, game: "Fortnite", title: "The rotation trick top 1% players use in build fights", tag: "Mechanics" },
  { id: 3, game: "Counter-Strike 2", title: "Utility lineups that still hold up post-patch", tag: "Updated" },
  { id: 4, game: "GTA Online", title: "Fastest money grind before the GTA 6 crossover events", tag: "Economy" },
  { id: 5, game: "League of Legends", title: "Wave management basics nobody explains to new junglers", tag: "Fundamentals" },
  { id: 6, game: "Call of Duty: Warzone", title: "Loadout tuning for the current circle meta", tag: "Meta" },
];

export const WALKTHROUGHS = [
  { id: 1, game: "Resident Evil Requiem", chapter: "Full story walkthrough, every ending", steps: 18 },
  { id: 2, game: "Crimson Desert", chapter: "Main questline + every boss fight", steps: 24 },
  { id: 3, game: "Elden Ring: Nightreign", chapter: "Every ending explained", steps: 12 },
  { id: 4, game: "007 First Light", chapter: "100% completion, all gadgets", steps: 15 },
];

export type Tier = {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free Pass",
    price: 0,
    tagline: "Flip through for free",
    features: ["Price tracker, 5 wishlist slots", "Weekly tips digest", "Ad-supported"],
  },
  {
    id: "players-guide",
    name: "Player's Guide",
    price: 6.99,
    tagline: "The one most people bookmark",
    features: [
      "Unlimited wishlist + price-drop alerts",
      "Every walkthrough, ad-free",
      "Weekly meta reports on patch day",
    ],
    highlight: true,
  },
  {
    id: "completionist",
    name: "Completionist",
    price: 12.99,
    tagline: "For the min-maxers",
    features: [
      "Everything in Player's Guide",
      "Downloadable build sheets & maps",
      "Early access the moment patches land",
      "Private Discord with the writers",
    ],
  },
];
