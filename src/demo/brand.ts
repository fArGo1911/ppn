/**
 * Brewery brand presets + active-brand resolution. CUSTOMER-FIRST: the brewery owns the campaign, the pub owns
 * the venue, PubPlay Network only powers it (subtle "powered by"). Each preset carries full colour TOKENS so the
 * whole app re-skins per brewery (e.g. a white/red brand), plus image slots, dynamic text, AI scripts.
 *
 * POC-safe: seeded TypeScript config + premium placeholder gradients (no real copyrighted assets, no upload).
 */

export interface ThemeColours {
  primary: string; // brand colour (buttons, highlights)
  primaryDark: string;
  secondary: string;
  accent: string;
  bg: string; // page background
  surface: string; // cards/strips
  border: string;
  text: string;
  muted: string;
  onBrand: string; // text/icon ON the brand colour (contrast-safe)
  success: string;
  warning: string;
}

export interface DemoBrand {
  id: string;
  // ── Identity (PRIMARY) ──
  sponsorName: string; // brewery name
  tagline: string;
  broughtBy: string;
  campaignName: string;
  pubName: string; // fallback/display; live venue comes from DB
  eventName: string; // NOT "PubPlay …" — pub/brewery owns the event copy
  offer: string;
  responsibleNote: string;
  cta: string;
  market: "SE" | "DE" | "UK";
  // ── Platform (SECONDARY) ──
  network: string;
  poweredBy: string; // "powered by PubPlay Network"
  // ── Theme + assets ──
  colours: ThemeColours;
  primary: string; // alias of colours.primary (kept for existing usages)
  primaryDark: string;
  heroOverlayMode: "dark" | "light" | "none";
  heroImageAltText: string;
  images: { logoUrl?: string; heroUrl?: string; venueUrl?: string; sponsorSlideUrl?: string; phoneCardUrl?: string; lowerThirdUrl?: string };
  /** Real brewery VIDEO assets — external URL (YouTube/Vimeo embed) or local/hosted MP4. Always provide a
   * fallbackImage. POC: a swappable slot/player/fallback structure — NOT a downloader/scraper. */
  video: {
    tvIntroVideoUrl?: string;
    sponsorBumperVideoUrl?: string;
    videoQuestionUrl?: string;
    closingVideoUrl?: string;
    fallbackImage?: string;
    sourceNote?: string;
  };
  ai: Record<"eventIntro" | "roundIntro" | "sponsoredIntro" | "questionReadout" | "answerReveal" | "intermission" | "winner", string>;
}

function aiScripts(brewery: string): DemoBrand["ai"] {
  return {
    eventIntro: `Welcome to The Anchor for tonight's Quiz Night, brought to you by ${brewery}. Grab your team, scan the QR code, and answer on your phones. Tonight we'll mix general knowledge, local questions, music, sport, and a sponsored round. Staff are in control, so shout if you need help. Let's get started.`,
    roundIntro: "Round {n} coming up — phones ready, teams.",
    sponsoredIntro: `This round is brought to you by ${brewery} — answer for bonus bragging rights.`,
    questionReadout: "Here's your question…",
    answerReveal: "And the correct answer is…",
    intermission: `Quick breather — grab a drink. Next round in a moment, courtesy of ${brewery}.`,
    winner: `Tonight's champions are {team}! Well played. Thanks to ${brewery} — see you next week.`,
  };
}

// ── Preset A: Northgate (dark theme, amber) ──────────────────────────────────
const NORTHGATE: DemoBrand = {
  id: "northgate",
  sponsorName: "Northgate Brewing Co.",
  tagline: "Good beer · good craic · good quiz",
  broughtBy: "Brought to you by Northgate Brewing Co.",
  campaignName: "Northgate Quiz Nights",
  pubName: "The Anchor",
  eventName: "Quiz Night",
  offer: "Tonight: 20% off the kitchen for every team",
  responsibleNote: "Please drink responsibly. 18+. Prize: food discount — no alcohol required.",
  cta: "Back next Thursday — see you then!",
  market: "UK",
  network: "PubPlay Network",
  poweredBy: "powered by PubPlay Network",
  heroOverlayMode: "dark",
  heroImageAltText: "Northgate Brewing Co. quiz night campaign image at The Anchor",
  images: {},
  video: {
    // Demo placeholder (Big Buck Bunny, Creative Commons) — swap per brewery. External URL or local MP4.
    tvIntroVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoQuestionUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    sourceNote: "Demo sample clip (CC) — replace with the brewery's own bumper/intro.",
  },
  ai: aiScripts("Northgate Brewing Co."),
  primary: "#f59e0b",
  primaryDark: "#b45309",
  colours: {
    primary: "#f59e0b", primaryDark: "#b45309", secondary: "#0ea5e9", accent: "#f59e0b",
    bg: "#0b1220", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)",
    text: "#e2e8f0", muted: "#94a3b8", onBrand: "#0b1220", success: "#22c55e", warning: "#f59e0b",
  },
};

// ── Preset B: Crimson (LIGHT theme, red/white) — proves full theme re-skin ────
const CRIMSON: DemoBrand = {
  id: "crimson",
  sponsorName: "Crimson & Co. Brewery",
  tagline: "Bold ales · proper pub quizzes",
  broughtBy: "Brought to you by Crimson & Co.",
  campaignName: "Crimson Pub League",
  pubName: "The Anchor",
  eventName: "Quiz Night",
  offer: "Winning team: a Crimson & Co. food platter",
  responsibleNote: "Please drink responsibly. 18+. Non-alcohol prize.",
  cta: "Next match-day special soon — see you then!",
  market: "UK",
  network: "PubPlay Network",
  poweredBy: "powered by PubPlay Network",
  heroOverlayMode: "dark",
  heroImageAltText: "Crimson & Co. Brewery quiz night campaign image at The Anchor",
  images: {},
  video: {
    // Demo placeholder (Big Buck Bunny, Creative Commons) — swap per brewery. External URL or local MP4.
    tvIntroVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoQuestionUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    sourceNote: "Demo sample clip (CC) — replace with the brewery's own bumper/intro.",
  },
  ai: aiScripts("Crimson & Co."),
  primary: "#dc2626",
  primaryDark: "#991b1b",
  colours: {
    primary: "#dc2626", primaryDark: "#991b1b", secondary: "#1f2937", accent: "#dc2626",
    bg: "#f8fafc", surface: "#ffffff", border: "rgba(15,23,42,0.12)",
    text: "#0f172a", muted: "#64748b", onBrand: "#ffffff", success: "#16a34a", warning: "#b45309",
  },
};

export const PRESETS: DemoBrand[] = [NORTHGATE, CRIMSON];

const STORAGE_KEY = "ppn_brand";

export function getActiveBrand(): DemoBrand {
  try {
    const id = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return PRESETS.find((p) => p.id === id) ?? NORTHGATE;
  } catch {
    return NORTHGATE;
  }
}

export function setActiveBrand(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Active brand for this page load. Switching a preset persists + reloads (see /config). */
export const DEMO_BRAND: DemoBrand = getActiveBrand();

export function brandInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
