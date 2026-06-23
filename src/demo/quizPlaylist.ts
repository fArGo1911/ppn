/**
 * POC quiz-evening RUN-ORDER model (source-only; NOT a CMS, NOT Supabase, NO generation).
 * Builds the ordered run of the night (intro → 5 question readouts → pause → combined answer-review → winner →
 * outro) from the authoritative bank's compiled playlist, plus the host run-mode concept, script-style variants
 * and an imaginary tournament/event context for script reference placeholders.
 *
 * The bank authority + deterministic playlist compiler + audio-key convention live in `./questionBank`.
 * This is a PLANNING/script-structure model. It does NOT drive the live game loop and writes nothing to the DB.
 */
import { DEMO_PLAYLIST, answerReviewKey, DEMO_ID, type BankQuestion } from "./questionBank";

export { DEMO_PLAYLIST };
export type { BankQuestion };

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
  // Answer-review phase — ONE combined reveal of all answers, in playlist order, LATER (never after each question).
  add({ phase: "review", label: "Answer review (Q1–Q5)", cue: "Reveal all answers in order — combined", file: answerReviewKey(DEMO_ID), status: "stored-only", detail: playlist.map((q) => `Q${q.order}: ${q.answer}`).join(" · ") });
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
