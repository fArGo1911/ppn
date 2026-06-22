/**
 * Media zones + seeded media collections (POC: config-driven, no media engine/CMS/upload/tracking).
 * Zone IDs are stable so later tracking (by screen state · sponsor asset · event · venue · timestamp) can attach
 * without restructuring. Slides are built from the active brewery preset so they re-skin/re-text per brewery.
 */
import type { DemoBrand } from "./brand";

export type MediaType = "image" | "carousel" | "slideshow" | "video" | "text";

export interface MediaZone {
  id: string;
  surface: "player" | "TV" | "host" | "presenter" | "KPI" | "rollout";
  screenState: string;
  allowed: MediaType[];
  aspect: string;
  recommended: string;
  safeText: "top" | "centre" | "bottom" | "left" | "right";
  overlay: "dark" | "light" | "none";
  fallback: string;
  sponsorAllowed: boolean;
  playerActionVisible: boolean;
}

export const MEDIA_ZONES: MediaZone[] = [
  { id: "playerHeroCarousel", surface: "player", screenState: "join", allowed: ["carousel", "image"], aspect: "16/9", recommended: "1080×1350 (4:5) / 1200×400", safeText: "bottom", overlay: "dark", fallback: "brand gradient + pub/event", sponsorAllowed: true, playerActionVisible: true },
  { id: "playerWaitingSponsorCard", surface: "player", screenState: "waiting", allowed: ["carousel", "image", "text"], aspect: "4/5", recommended: "1080×1350", safeText: "centre", overlay: "dark", fallback: "sponsor message card", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvPreEventWelcome", surface: "TV", screenState: "welcome", allowed: ["image", "carousel", "text"], aspect: "16/9", recommended: "1920×1080", safeText: "left", overlay: "dark", fallback: "brand gradient + QR", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvSponsorSlideshow", surface: "TV", screenState: "slideshow", allowed: ["slideshow", "carousel", "image"], aspect: "16/9", recommended: "1920×1080", safeText: "centre", overlay: "dark", fallback: "sponsor slides", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvActiveQuestion", surface: "TV", screenState: "question", allowed: ["text", "image", "video"], aspect: "16/9", recommended: "1920×1080", safeText: "centre", overlay: "dark", fallback: "question text", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvPauseIntermission", surface: "TV", screenState: "pause", allowed: ["slideshow", "carousel"], aspect: "16/9", recommended: "1920×1080", safeText: "centre", overlay: "dark", fallback: "sponsor slides + back soon", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvAnswerReveal", surface: "TV", screenState: "reveal", allowed: ["text", "image"], aspect: "16/9", recommended: "1920×1080", safeText: "centre", overlay: "dark", fallback: "correct answer", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvScoreboard", surface: "TV", screenState: "scoreboard", allowed: ["text"], aspect: "16/9", recommended: "1920×1080", safeText: "centre", overlay: "none", fallback: "standings", sponsorAllowed: true, playerActionVisible: false },
  { id: "tvVictoryScreen", surface: "TV", screenState: "victory", allowed: ["image", "text"], aspect: "16/9", recommended: "1920×1080", safeText: "centre", overlay: "dark", fallback: "winner + sponsor close", sponsorAllowed: true, playerActionVisible: false },
  { id: "presenterCampaignHero", surface: "presenter", screenState: "landing", allowed: ["carousel", "image"], aspect: "16/9", recommended: "1920×1080 (or 3:2)", safeText: "left", overlay: "dark", fallback: "campaign hero", sponsorAllowed: true, playerActionVisible: false },
  { id: "kpiHeader", surface: "KPI", screenState: "report", allowed: ["image", "text"], aspect: "4/1", recommended: "1600×400", safeText: "left", overlay: "dark", fallback: "logo + campaign name", sponsorAllowed: true, playerActionVisible: false },
  { id: "rolloutMapHero", surface: "rollout", screenState: "network", allowed: ["image"], aspect: "16/9", recommended: "1920×1080", safeText: "bottom", overlay: "dark", fallback: "network graphic", sponsorAllowed: true, playerActionVisible: false },
];

export const CAROUSEL_GUIDANCE = [
  "TV carousel slides: 16:9, 1920×1080",
  "TV lower-third graphics: 1920×240",
  "Phone carousel cards: 4:5 or 1:1 (1080×1350 / 1080×1080)",
  "Presenter carousel slides: 16:9 or 3:2",
  "Keep text inside safe areas; avoid too much text on TV slides",
  "Use a dark overlay for readability when text sits over images",
  "Use SVG/transparent logo overlays; keep sponsor CTA short",
];

/** Extra dynamic-text / copy slots (beyond the AI scripts on the brand preset). */
export const COPY_SLOTS = [
  "Pre-event welcome copy",
  "QR join instruction",
  "Sponsor slideshow headlines",
  "Pause/intermission copy",
  "Active round intro",
  "Closing / next-event CTA",
];

// ── Seeded slide collections (built from the active preset → brewery-specific text) ──
export interface Slide {
  id: string;
  headline?: string;
  subtitle?: string;
  cta?: string;
  offer?: boolean;
  logo?: boolean;
  responsible?: boolean;
  overlay?: "dark" | "light" | "none";
  image?: string;
  aspect?: string;
}

export function preEventSlides(b: DemoBrand): Slide[] {
  return [
    { id: "pre-1", headline: `Welcome to ${b.pubName}`, subtitle: `${b.eventName} · ${b.broughtBy}`, logo: true },
    { id: "pre-2", headline: b.sponsorName, subtitle: b.tagline, logo: true },
    { id: "pre-3", headline: "Tonight's reward", subtitle: b.offer, offer: true, responsible: true },
  ];
}
export function sponsorSlides(b: DemoBrand): Slide[] {
  return [
    { id: "spo-1", headline: b.sponsorName, subtitle: b.tagline, logo: true },
    { id: "spo-2", headline: "On the menu tonight", subtitle: b.offer, offer: true, responsible: true },
    { id: "spo-3", headline: "Next round coming up", subtitle: "Grab a drink — back in a moment", cta: b.cta },
  ];
}
export function pauseSlides(b: DemoBrand): Slide[] {
  return [
    { id: "pau-1", headline: "Back soon", subtitle: `Next round, courtesy of ${b.sponsorName}`, logo: true },
    { id: "pau-2", headline: "Tonight's reward", subtitle: b.offer, offer: true, responsible: true },
  ];
}
export function victorySlides(b: DemoBrand): Slide[] {
  return [
    { id: "vic-1", headline: "🏆 Tonight's champions", subtitle: "{team}", logo: true },
    { id: "vic-2", headline: `Thanks to ${b.sponsorName}`, subtitle: b.cta, offer: true },
  ];
}
export function playerHeroSlides(b: DemoBrand): Slide[] {
  return [
    { id: "ph-1", headline: b.pubName, subtitle: `${b.eventName} · ${b.sponsorName}`, aspect: "16/9" },
    { id: "ph-2", headline: "Tonight's reward", subtitle: b.offer, offer: true, aspect: "16/9" },
  ];
}
