/**
 * PPN demo brand config (SEEDED/static for this slice — not the full brand studio).
 * Drives the brand-aware layout zones across player / host / TV / presenter surfaces. Later this becomes the
 * swappable brewery preset; for now it's one tasteful default so the zones show where branding belongs.
 *
 * Responsible-sponsor default: the "offer" is a NON-alcohol example (food discount).
 */
export interface DemoBrand {
  /** Platform identity — SECONDARY (subtle "powered by" only; never the main visual sender). */
  network: string;
  /** Brewery/sponsor — the PRIMARY brand on customer-facing surfaces. */
  sponsorName: string;
  broughtBy: string;
  tagline: string;
  offer: string;
  responsibleNote: string;
  cta: string;
  market: "SE" | "DE" | "UK";
  primary: string; // brand accent (CSS color)
  primaryDark: string;
  /** Image slots — undefined in the POC → premium gradient placeholders mark where real assets go. */
  images: {
    logoUrl?: string; // SVG/PNG, transparent preferred
    heroUrl?: string; // 16:9 campaign hero/background
    phoneBannerUrl?: string; // ~1200x400 wide
    lowerThirdUrl?: string; // ~1920x240 TV lower-third
  };
  /** AI host scripts (planning only — wired in the later AI slice). */
  ai: Record<
    "eventIntro" | "roundIntro" | "sponsoredIntro" | "questionReadout" | "answerReveal" | "intermission" | "winner",
    string
  >;
}

export const DEMO_BRAND: DemoBrand = {
  network: "PubPlay Network",
  sponsorName: "Northgate Brewing Co.",
  broughtBy: "Brought to you by Northgate Brewing Co.",
  tagline: "Good beer · good craic · good quiz",
  offer: "Tonight: 20% off the kitchen for every team",
  responsibleNote: "Please drink responsibly. 18+. Prize: food discount — no alcohol required.",
  cta: "Back next Thursday — see you then!",
  market: "UK",
  primary: "#f59e0b", // amber
  primaryDark: "#b45309",
  images: {},
  ai: {
    eventIntro:
      "Welcome to The Anchor for tonight's PubPlay Quiz Night, brought to you by Northgate Brewing Co. Grab your team, scan the QR code, and answer on your phones. Tonight we'll mix general knowledge, local questions, music, sport, and a sponsored round. Staff are in control, so shout if you need help. Let's get started.",
    roundIntro: "Round {n} coming up — phones ready, teams.",
    sponsoredIntro: "This round is brought to you by Northgate Brewing Co. — answer for bonus bragging rights.",
    questionReadout: "Here's your question…",
    answerReveal: "And the correct answer is…",
    intermission: "Quick breather — grab a drink. Next round in a moment, courtesy of Northgate Brewing Co.",
    winner: "Tonight's champions are {team}! Well played. Thanks to Northgate Brewing Co. — see you next week.",
  },
};

/** Two initials for a simple logo placeholder (until real logo upload in the brand studio). */
export function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
