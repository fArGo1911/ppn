/**
 * POC quiz-evening RUN-ORDER / playlist model (source-only; NOT a CMS, NOT Supabase, NO generation).
 * Defines a small 5-question demo playlist drawn from the seeded question bank, the ordered run of the night
 * (intro → 5 question readouts → pause → 5 answer reveals → winner → outro), the host run-mode concept,
 * script-style variants and an imaginary tournament/event context for script reference placeholders.
 *
 * This is a PLANNING/script-structure model. It does NOT drive the live game loop (which still runs its own
 * per-question reveal phases) and writes nothing to the DB. Per-question audio is file-drop reference only.
 */
import { QUESTION_POOL } from "./questionPool";
import { categoryLabel, type ContentCategoryId } from "../lib/contentMix";

export interface BankQuestion {
  order: number;
  id: string;
  category: ContentCategoryId;
  categoryLabel: string;
  prompt: string;
  answer: string;
  /** Optional answer explanation / commentary (placeholder; operator fills the real colour). */
  commentary?: string;
  difficulty?: "easy" | "medium" | "hard";
  sponsor: boolean;
  /** Expected per-question audio filenames (deployed under the preset audio dir; file-drop, not in-app upload). */
  readoutFile: string;
  reviewFile: string;
  /** Optional media slot reference (picture/video questions). */
  mediaSlot?: string;
}

/** Pull a seeded pool question by id (throws at module load if a fixture id is wrong — fails loud, not silent). */
function pick(id: string): { category: ContentCategoryId; prompt: string; answer: string; difficulty?: "easy" | "medium" | "hard" } {
  const q = QUESTION_POOL.find((p) => p.id === id);
  if (!q) throw new Error(`quizPlaylist: seeded question "${id}" not found`);
  return { category: q.category as ContentCategoryId, prompt: q.prompt, answer: q.answer, difficulty: q.difficulty };
}

// ── Tonight's demo playlist: 5 selected questions (varied pub-quiz mix), drawn from the seeded bank ──
const SELECTED_IDS = ["gen-01", "spt-02", "mus-03", "pic-01", "spo-01"];
export const DEMO_PLAYLIST: BankQuestion[] = SELECTED_IDS.map((id, i) => {
  const q = pick(id);
  const n = String(i + 1).padStart(2, "0");
  return {
    order: i + 1,
    id,
    category: q.category,
    categoryLabel: categoryLabel(q.category),
    prompt: q.prompt,
    answer: q.answer,
    difficulty: q.difficulty,
    sponsor: q.category === "sponsor",
    readoutFile: `question-${n}.mp3`,
    reviewFile: `reveal-${n}.mp3`,
    mediaSlot: q.category === "picture" ? "question image" : q.category === "video" ? "question clip" : undefined,
  };
});

export type RunPhase = "intro" | "howto" | "question" | "pause" | "review" | "winner" | "outro";
export type RunStatus = "live" | "stored-only" | "not-wired";

export interface RunStep {
  step: number;
  phase: RunPhase;
  phaseLabel: string;
  label: string;
  category?: string;
  /** What the host reads / the cue this step maps to. */
  cue: string;
  /** Expected audio file (per-question) or audioCues key (global). */
  file?: string;
  status: RunStatus;
  /** Question/answer detail for question & review steps. */
  detail?: string;
}

const PHASE_LABEL: Record<RunPhase, string> = {
  intro: "Opening", howto: "Opening", question: "Question phase", pause: "Hand-in",
  review: "Answer-review phase", winner: "Result", outro: "Closing",
};

/** Build the ordered run of the night from a playlist: intro → readouts → pause → reveals → winner → outro. */
export function buildRunOrder(playlist: BankQuestion[] = DEMO_PLAYLIST): RunStep[] {
  const steps: RunStep[] = [];
  let n = 1;
  const add = (s: Omit<RunStep, "step" | "phaseLabel">) => steps.push({ ...s, step: n++, phaseLabel: PHASE_LABEL[s.phase] });

  add({ phase: "intro", label: "Intro", cue: "Welcome + sponsor", file: "event-intro.mp3", status: "live" });
  add({ phase: "howto", label: "How to play", cue: "Explain QR / teams / one answer per team", status: "not-wired" });
  // Question phase — read ALL questions first; no answers yet.
  for (const q of playlist) add({ phase: "question", label: `Q${q.order} readout`, category: q.categoryLabel, cue: "Read the question", file: q.readoutFile, status: "stored-only", detail: q.prompt });
  add({ phase: "pause", label: "Pause / answer hand-in", cue: "Collect answers — no reveals yet", status: "not-wired" });
  // Answer-review phase — reveal answers question by question, LATER.
  for (const q of playlist) add({ phase: "review", label: `A${q.order} reveal`, category: q.categoryLabel, cue: "Reveal the answer", file: q.reviewFile, status: "stored-only", detail: `${q.prompt} → ${q.answer}` });
  add({ phase: "winner", label: "Winner", cue: "Announce winning Team {number}", file: "winner.mp3", status: "live" });
  add({ phase: "outro", label: "Outro / next event", cue: "Thanks + next quiz date", status: "not-wired" });
  return steps;
}

// ── Host run mode (manual / semi-automatic / automatic) — concept model + honest live status ──
export type HostRunModeId = "manual" | "semi" | "auto";
export interface HostRunMode { id: HostRunModeId; label: string; blurb: string; status: "live now" | "concept only" | "not wired" }
export const HOST_RUN_MODES: HostRunMode[] = [
  { id: "manual", label: "Manual", blurb: "Host controls every cue and step from the host console.", status: "live now" },
  { id: "semi", label: "Semi-automatic", blurb: "Host starts each playlist step; the app cues the prepared audio/visual for that step.", status: "concept only" },
  { id: "auto", label: "Automatic", blurb: "App plays through the run order with pauses/timers where safe.", status: "not wired" },
];

// ── Script style variants (direction only — NO generated final scripts) ──
export interface ScriptStyle { id: string; label: string; blurb: string }
export const SCRIPT_STYLES: ScriptStyle[] = [
  { id: "warm", label: "Warm pub host", blurb: "Friendly, welcoming, a regular's tone." },
  { id: "sport", label: "Sport-heavy", blurb: "Banter, match-day energy, sport references." },
  { id: "dry", label: "Dry humour", blurb: "Deadpan, understated one-liners." },
  { id: "family", label: "Family-friendly", blurb: "Inclusive, clean, all-ages." },
  { id: "sponsor", label: "Sponsor-forward", blurb: "Leans into the sponsor/brand moments." },
  { id: "fast", label: "Fast-paced", blurb: "Brisk, punchy, keeps the room moving." },
];

// ── Imaginary tournament / event context (POC) — feeds script reference placeholders, NOT scoring ──
export interface EventContext {
  eventDate: string;
  venue: string;
  series: string;
  eventNumberInMonth: string;
  stage: string;
  advancesTo: string;
  nextEventDate: string;
  hostName: string;
  sponsorPlaceholder: string;
}
export const DEMO_EVENT_CONTEXT: EventContext = {
  eventDate: "Sunday 18th September",
  venue: "Oliver's",
  series: "Oliver's Sunday Quiz League",
  eventNumberInMonth: "3rd this month",
  stage: "Qualifier",
  advancesTo: "Semi-final",
  nextEventDate: "Sunday 25th September",
  hostName: "your host (placeholder)",
  sponsorPlaceholder: "{sponsor}",
};

/** A sample opener built from the event context (reference placeholder — NOT a generated final script). */
export function eventOpenerReference(ctx: EventContext = DEMO_EVENT_CONTEXT): string {
  return `Today is ${ctx.eventDate}. Welcome to ${ctx.venue} — this is the ${ctx.eventNumberInMonth} ${ctx.series}, brought to you by ${ctx.sponsorPlaceholder}. Tonight is a ${ctx.stage}: tonight's winning team goes through to the ${ctx.advancesTo}. Next quiz is ${ctx.nextEventDate}.`;
}
