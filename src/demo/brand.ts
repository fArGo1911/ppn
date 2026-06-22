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

export type VideoSourceType = "embed" | "local" | "external";

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
  /** Real brewery VIDEO assets, by source type:
   *   "embed"    → YouTube/Vimeo embed URL (rendered in an iframe)
   *   "external" → external hosted MP4/WebM URL (rendered in an HTML <video>)
   *   "local"    → local MP4/WebM placed manually in public/demo/ (rendered in an HTML <video>)
   * Always provide a fallbackImage. POC = a swappable slot/player/fallback — NEVER a downloader/scraper. */
  video: {
    tvIntroVideoSourceType?: VideoSourceType;
    tvIntroVideoUrl?: string;
    sponsorBumperVideoSourceType?: VideoSourceType;
    sponsorBumperVideoUrl?: string;
    videoQuestionSourceType?: VideoSourceType;
    videoQuestionUrl?: string;
    closingVideoSourceType?: VideoSourceType;
    closingVideoUrl?: string;
    fallbackImage?: string;
    sourceNote?: string;
  };
  /** AI scripts (text slots). eventIntro = the optional first-class evening opener. */
  ai: Record<"eventIntro" | "roundIntro" | "sponsoredIntro" | "questionReadout" | "answerReveal" | "intermission" | "winner", string>;
  /** Default for the optional AI evening introduction (host can still include/skip per session). */
  aiIntroEnabled: boolean;
  /** Pre-generated MP3 audio assets (PLAYBACK ONLY). Reference local demo paths under public/demo/audio/<preset>/.
   * Files are NOT committed (no copyrighted/voice audio in the repo) — absent files fall back to the on-screen
   * script. Generate MP3s manually (e.g. ElevenLabs) OUTSIDE the app; the app never calls a TTS API. */
  audio: {
    audioBaseDir?: string; // e.g. "/demo/audio/northgate" — per-question files: question-01.mp3, reveal-01.mp3
    aiEventIntroAudioUrl?: string;
    aiRoundIntroAudioUrl?: string;
    aiSponsoredRoundIntroAudioUrl?: string;
    aiQuestionReadoutAudioUrl?: string;
    aiAnswerRevealAudioUrl?: string;
    aiWinnerAnnouncementAudioUrl?: string;
    questionChimeAudioUrl?: string;
    sponsorAudioMessageUrl?: string;
    chimeEnabled: boolean;
    questionIntroEnabled: boolean;
    questionIntroVariants: string[]; // varied "next question coming up" lines (avoid robotic feel)
    questionNumberAnnouncementVariants: string[]; // "{n}" templated, e.g. "Question {n}."
  };
}

/** Build the standard demo audio asset map for a preset directory + localised announcement variants. */
function demoAudio(dir: string, introVariants: string[], numberVariants: string[]): DemoBrand["audio"] {
  return {
    audioBaseDir: dir,
    aiEventIntroAudioUrl: `${dir}/event-intro.mp3`,
    aiRoundIntroAudioUrl: `${dir}/round-intro.mp3`,
    aiSponsoredRoundIntroAudioUrl: `${dir}/sponsored-round-intro.mp3`,
    aiQuestionReadoutAudioUrl: `${dir}/question-readout.mp3`,
    aiAnswerRevealAudioUrl: `${dir}/answer-reveal.mp3`,
    aiWinnerAnnouncementAudioUrl: `${dir}/winner.mp3`,
    questionChimeAudioUrl: `${dir}/question-chime.mp3`,
    sponsorAudioMessageUrl: `${dir}/sponsor-message.mp3`,
    chimeEnabled: true,
    questionIntroEnabled: true,
    questionIntroVariants: introVariants,
    questionNumberAnnouncementVariants: numberVariants,
  };
}

/** Per-question readout/reveal audio path (e.g. question-01.mp3 / reveal-01.mp3), or the generic clip. */
export function questionAudio(b: DemoBrand, n: number): { readout?: string; reveal?: string } {
  const dir = b.audio.audioBaseDir;
  if (!dir) return { readout: b.audio.aiQuestionReadoutAudioUrl, reveal: b.audio.aiAnswerRevealAudioUrl };
  const p = String(n).padStart(2, "0");
  return { readout: `${dir}/question-${p}.mp3`, reveal: `${dir}/reveal-${p}.mp3` };
}

// Shared demo video references (CC / public samples) — swappable per brewery; local files go in public/demo/.
const DEMO_VIDEO: DemoBrand["video"] = {
  tvIntroVideoSourceType: "embed",
  tvIntroVideoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", // Big Buck Bunny (CC, embeddable)
  sponsorBumperVideoSourceType: "local",
  sponsorBumperVideoUrl: "/demo/sponsor-bumper.mp4", // not bundled → shows fallback (drop a file in public/demo/)
  videoQuestionSourceType: "external",
  videoQuestionUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  closingVideoSourceType: "external",
  closingVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  sourceNote: "Demo references (CC / public samples) — replace with the brewery's own clips.",
};

// ── Demo C — UK: Northgate Brewing Co. (default; matches the seeded venue "The Anchor") ──────────
const NORTHGATE: DemoBrand = {
  id: "northgate",
  sponsorName: "Northgate Brewing Co.",
  tagline: "Good beer · good craic · good quiz",
  broughtBy: "Brought to you by Northgate Brewing Co.",
  campaignName: "Northgate Quiz Nights",
  pubName: "The Anchor",
  eventName: "Quiz Night",
  offer: "Tonight: 20% off the kitchen for every team",
  responsibleNote: "Please drink responsibly. 18+. Prize is a food discount — no alcohol required. Ask staff for tonight's offer.",
  cta: "Back next Thursday — see you then!",
  market: "UK",
  network: "PubPlay Network",
  poweredBy: "powered by PubPlay Network",
  heroOverlayMode: "dark",
  heroImageAltText: "Northgate Brewing Co. quiz night campaign image at The Anchor",
  images: {},
  video: { ...DEMO_VIDEO },
  aiIntroEnabled: true,
  audio: demoAudio("/demo/audio/northgate",
    ["Next question coming up.", "Get ready for the next one.", "Here comes the next question.", "Eyes down — next question.", "Right then, next up…"],
    ["Question {n}.", "Question {n} — listen carefully.", "Next up, question {n}.", "Here comes question {n}.", "Right then, question {n}."]),
  ai: {
    eventIntro: "Good evening and welcome to The Anchor for tonight's Quiz Night, brought to you by Northgate Brewing Co. Scan the QR code on your table, give your team a name, and answer right there on your phone — one shared answer per team. Tonight we'll mix general knowledge, a local Manchester round, sport, football, a music round and a Northgate sponsored round, with a tie-breaker to finish. Your hosts are in control all night, so give us a shout if you need a hand. Phones ready — let's play!",
    roundIntro: "Round {n} coming up — phones ready, teams.",
    sponsoredIntro: "This round is brought to you by Northgate Brewing Co. — answer well for bonus bragging rights.",
    questionReadout: "Here's your question…",
    answerReveal: "And the correct answer is…",
    intermission: "Quick breather — grab a drink at the bar. Next round in a moment, courtesy of Northgate Brewing Co.",
    winner: "Tonight's champions are {team}! Brilliantly played. Thanks to Northgate Brewing Co. — and we'll see you next Thursday.",
  },
  primary: "#f59e0b",
  primaryDark: "#b45309",
  colours: {
    primary: "#f59e0b", primaryDark: "#b45309", secondary: "#0ea5e9", accent: "#f59e0b",
    bg: "#0b1220", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)",
    text: "#e2e8f0", muted: "#94a3b8", onBrand: "#0b1220", success: "#22c55e", warning: "#f59e0b",
  },
};

// ── Demo B — Germany: Adlerbräu (Bavarian regional-premium style; inspired-not-copied) ──────────
const ADLERBRAU: DemoBrand = {
  id: "adlerbrau",
  sponsorName: "Adlerbräu München",
  tagline: "Bayerische Braukunst seit 1516",
  broughtBy: "Präsentiert von Adlerbräu München",
  campaignName: "Adlerbräu Quizabend",
  pubName: "Zum Goldenen Hirsch",
  eventName: "Quizabend",
  offer: "Heute Abend: eine Brotzeit-Platte für das Siegerteam",
  responsibleNote: "Bitte trinke verantwortungsvoll. Ab 18. Preis ohne Alkohol — frag das Personal nach dem heutigen Angebot.",
  cta: "Nächste Woche wieder — bis dann!",
  market: "DE",
  network: "PubPlay Network",
  poweredBy: "ermöglicht durch PubPlay Network",
  heroOverlayMode: "dark",
  heroImageAltText: "Adlerbräu München Quizabend-Kampagnenbild im Zum Goldenen Hirsch",
  images: {},
  video: { ...DEMO_VIDEO },
  aiIntroEnabled: true,
  audio: demoAudio("/demo/audio/adlerbrau",
    ["Gleich kommt die nächste Frage.", "Macht euch bereit.", "Die nächste Frage kommt.", "Aufgepasst — nächste Frage.", "Weiter geht's…"],
    ["Frage {n}.", "Frage {n} — hört gut zu.", "Als Nächstes: Frage {n}.", "Es kommt Frage {n}.", "Also dann, Frage {n}."]),
  ai: {
    eventIntro: "Herzlich willkommen im Zum Goldenen Hirsch zum heutigen Quizabend, präsentiert von Adlerbräu München. Scannt den QR-Code am Tisch, gebt eurem Team einen Namen und antwortet direkt am Handy — eine gemeinsame Antwort pro Team. Heute mischen wir Allgemeinwissen, eine Münchner Lokalrunde, Sport, Bundesliga, eine Musikrunde und eine Adlerbräu-Sponsorenrunde, mit einem Stechen zum Schluss. Das Personal hat alles im Griff — meldet euch, wenn ihr Hilfe braucht. Handys bereit — auf geht's!",
    roundIntro: "Runde {n} steht an — Handys bereit, Teams.",
    sponsoredIntro: "Diese Runde wird euch von Adlerbräu München präsentiert — antwortet gut für Bonus-Ruhm.",
    questionReadout: "Hier kommt eure Frage…",
    answerReveal: "Und die richtige Antwort ist…",
    intermission: "Kurze Pause — holt euch ein Getränk. Gleich geht's weiter, mit freundlicher Unterstützung von Adlerbräu München.",
    winner: "Die heutigen Sieger sind {team}! Stark gespielt. Danke an Adlerbräu München — bis nächste Woche!",
  },
  primary: "#16a34a",
  primaryDark: "#15803d",
  colours: {
    primary: "#16a34a", primaryDark: "#15803d", secondary: "#ca8a04", accent: "#facc15",
    bg: "#0c130f", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)",
    text: "#e7efe9", muted: "#9bb0a2", onBrand: "#ffffff", success: "#22c55e", warning: "#ca8a04",
  },
};

// ── Demo A — Sweden: Nordström Bryggeri (Swedish craft style) ───────────────────────────────────
const NORDSTROM: DemoBrand = {
  id: "nordstrom",
  sponsorName: "Nordström Bryggeri",
  tagline: "Svenskt hantverk · god stämning",
  broughtBy: "Presenteras av Nordström Bryggeri",
  campaignName: "Nordström Quizkväll",
  pubName: "Kvarteret Krog",
  eventName: "Quizkväll",
  offer: "Ikväll: 20% på köket för varje lag",
  responsibleNote: "Drick ansvarsfullt. 18+. Priset är alkoholfritt — fråga personalen om kvällens erbjudande.",
  cta: "Tillbaka nästa torsdag — vi ses!",
  market: "SE",
  network: "PubPlay Network",
  poweredBy: "drivs av PubPlay Network",
  heroOverlayMode: "dark",
  heroImageAltText: "Nordström Bryggeri quizkväll-kampanjbild på Kvarteret Krog",
  images: {},
  video: { ...DEMO_VIDEO },
  aiIntroEnabled: true,
  audio: demoAudio("/demo/audio/nordstrom",
    ["Strax kommer nästa fråga.", "Gör er redo.", "Nästa fråga kommer nu.", "Skärpning — nästa fråga.", "Vi kör vidare…"],
    ["Fråga {n}.", "Fråga {n} — lyssna noga.", "Härnäst: fråga {n}.", "Här kommer fråga {n}.", "Nå då så, fråga {n}."]),
  ai: {
    eventIntro: "Varmt välkomna till Kvarteret Krog och kvällens Quizkväll, som presenteras av Nordström Bryggeri. Skanna QR-koden på bordet, döp ert lag och svara direkt i mobilen — ett gemensamt svar per lag. Ikväll blandar vi allmänbildning, en lokal Stockholmsrunda, sport, fotboll, en musikrunda och en Nordström-sponsrad runda, med ett utslagsfrågor på slutet. Personalen styr kvällen — ropa till om ni behöver hjälp. Mobiler redo — nu kör vi!",
    roundIntro: "Runda {n} på gång — mobiler redo, lag.",
    sponsoredIntro: "Den här rundan presenteras av Nordström Bryggeri — svara rätt för bonuspoäng i ära.",
    questionReadout: "Här kommer er fråga…",
    answerReveal: "Och det rätta svaret är…",
    intermission: "Kort paus — hämta något att dricka. Nästa runda strax, tack vare Nordström Bryggeri.",
    winner: "Kvällens mästare är {team}! Snyggt spelat. Tack till Nordström Bryggeri — vi ses nästa vecka!",
  },
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  colours: {
    primary: "#2563eb", primaryDark: "#1d4ed8", secondary: "#f5c518", accent: "#f5c518",
    bg: "#0a1120", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)",
    text: "#e4ecf7", muted: "#93a4bd", onBrand: "#ffffff", success: "#22c55e", warning: "#f5c518",
  },
};

/** Demo A (SE) · Demo B (DE) · Demo C (UK) — swappable presets, one per market. UK is the default
 * because the seeded live venue is The Anchor (UK). Switch at /config (persists + reloads). */
export const PRESETS: DemoBrand[] = [NORDSTROM, ADLERBRAU, NORTHGATE];

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
