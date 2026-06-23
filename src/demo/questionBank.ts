/**
 * POC question-bank AUTHORITY + deterministic playlist compiler (source-only; NOT a CMS, NOT Supabase, NO generation).
 *
 * Authoritative bank: `QUESTION_POOL` (src/demo/questionPool.ts) — stable IDs, category, prompt, answer, difficulty.
 * `src/demo/questionPacks.ts` is LEGACY/reference (richer per-question scripts, but a different set) and is NOT the
 * source of truth for the demo playlist.
 *
 * Audio-key convention (removes the audit's namespace collision): playlist cue files are namespaced
 * `playlist-<demoId>-q0N-readout.mp3` / `playlist-<demoId>-a0N-reveal.mp3` / `playlist-<demoId>-answer-review.mp3`.
 * These are DISTINCT from the live game's fixed `question-NN.mp3` / `reveal-NN.mp3` (seed.sql), so a playlist cue can
 * never collide with a live-game cue. Global cues (event-intro.mp3 / winner.mp3) stay as the single authoritative
 * host-consumed files.
 */
import { QUESTION_POOL, type PoolQuestion } from "./questionPool";
import { categoryLabel, CONTENT_CATEGORIES, type ContentCategoryId } from "../lib/contentMix";

// ── Authoritative bank (the seeded pool minus the tiebreak bucket, which is not a normal category) ──
export const QUESTION_BANK: PoolQuestion[] = QUESTION_POOL.filter((q) => q.category !== "tiebreak");

export interface BankCategoryCount { id: ContentCategoryId; label: string; count: number }
export function bankCategoryCounts(): BankCategoryCount[] {
  return CONTENT_CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: QUESTION_BANK.filter((q) => q.category === c.id).length }));
}

// ── Audio-key convention (playlist-namespaced; cannot collide with live-game question-NN.mp3) ──
const pad = (n: number) => String(n).padStart(2, "0");
export const readoutKey = (demoId: string, order: number) => `playlist-${demoId}-q${pad(order)}-readout.mp3`;
export const reviewKey = (demoId: string, order: number) => `playlist-${demoId}-a${pad(order)}-reveal.mp3`;
export const answerReviewKey = (demoId: string) => `playlist-${demoId}-answer-review.mp3`;

export interface BankQuestion {
  order: number;
  id: string;
  category: ContentCategoryId;
  categoryLabel: string;
  prompt: string;
  answer: string;
  /** Optional answer explanation / commentary (placeholder; operator adds the real colour). */
  commentary?: string;
  difficulty?: "easy" | "medium" | "hard";
  sponsor: boolean;
  /** Auto-built readout hint from the bank (not generated audio — just the line to record). */
  readoutScript: string;
  /** Playlist-namespaced cue files (file-drop reference; in-app per-question upload is parked). */
  readoutFile: string;
  reviewFile: string;
  /** Optional media slot reference (picture/video questions). */
  mediaSlot?: string;
}

function bankById(id: string): PoolQuestion {
  const q = QUESTION_BANK.find((p) => p.id === id);
  if (!q) throw new Error(`questionBank: question "${id}" not found in the authoritative bank`);
  return q;
}

function toBankQuestion(id: string, order: number, demoId: string): BankQuestion {
  const q = bankById(id);
  const category = q.category as ContentCategoryId;
  return {
    order, id, category, categoryLabel: categoryLabel(category),
    prompt: q.prompt, answer: q.answer, difficulty: q.difficulty,
    sponsor: category === "sponsor",
    readoutScript: `Question ${order}, ${categoryLabel(category)}: ${q.prompt}`,
    readoutFile: readoutKey(demoId, order),
    reviewFile: reviewKey(demoId, order),
    mediaSlot: category === "picture" ? "question image" : category === "video" ? "question clip" : undefined,
  };
}

// ── Deterministic selection (seeded; no Math.random) so a compiled playlist is stable across renders/builds ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export type MixProfileId = "mixed" | "general" | "sport" | "music" | "local";
export interface MixProfile { id: MixProfileId; label: string; categories: ContentCategoryId[] }
/** Each profile is an ordered category template; a sponsor slot is appended when sponsor inclusion is on. */
export const MIX_PROFILES: MixProfile[] = [
  { id: "mixed", label: "Mixed (balanced)", categories: ["general", "sport", "music", "picture"] },
  { id: "general", label: "General-heavy", categories: ["general", "general", "geography", "local"] },
  { id: "sport", label: "Sport-heavy", categories: ["sport", "sport", "general", "music"] },
  { id: "music", label: "Music-heavy", categories: ["music", "music", "general", "picture"] },
  { id: "local", label: "Local-heavy", categories: ["local", "local", "general", "geography"] },
];

export interface CompileOptions {
  mix?: MixProfileId;
  count?: number;
  seed?: string;
  demoId?: string;
  includeSponsor?: boolean;
  /** Pin an exact, curated id set (deterministic by construction) — used by the default demo playlist. */
  pinnedIds?: string[];
}

/** Build the ordered category template for a profile + options (length = count). */
function categoryTemplate(opts: CompileOptions): ContentCategoryId[] {
  const count = opts.count ?? 5;
  const profile = MIX_PROFILES.find((p) => p.id === (opts.mix ?? "mixed")) ?? MIX_PROFILES[0];
  const seq = [...profile.categories];
  if (opts.includeSponsor ?? true) seq.push("sponsor");
  const out: ContentCategoryId[] = [];
  for (let i = 0; i < count; i++) out.push(seq[i % seq.length]);
  return out;
}

/**
 * Compile a deterministic, ordered playlist from the authoritative bank.
 * Same options → same questions, every time (so the MP3 production list + answer-review order never drift).
 */
export function compilePlaylist(opts: CompileOptions = {}): BankQuestion[] {
  const demoId = opts.demoId ?? "demo";
  const count = opts.count ?? 5;
  let ids: string[];
  if (opts.pinnedIds && opts.pinnedIds.length) {
    ids = opts.pinnedIds.slice(0, count);
  } else {
    const seed = opts.seed ?? "demo";
    const template = categoryTemplate(opts);
    const used = new Set<string>();
    ids = template.map((cat, slot) => {
      const candidates = QUESTION_BANK.filter((q) => q.category === cat && !used.has(q.id));
      const pool = candidates.length ? candidates : QUESTION_BANK.filter((q) => !used.has(q.id));
      const idx = hashStr(`${seed}:${slot}:${cat}`) % pool.length;
      const chosen = pool[idx];
      used.add(chosen.id);
      return chosen.id;
    });
  }
  return ids.map((id, i) => toBankQuestion(id, i + 1, demoId));
}

// ── The active 5-question demo playlist — compiled from the authoritative bank (curated, deterministic) ──
export const DEMO_ID = "demo";
export const DEMO_COMPILE_OPTIONS: CompileOptions = {
  mix: "mixed", count: 5, includeSponsor: true, demoId: DEMO_ID,
  pinnedIds: ["gen-01", "spt-02", "mus-03", "pic-01", "spo-01"],
};
export const DEMO_PLAYLIST: BankQuestion[] = compilePlaylist(DEMO_COMPILE_OPTIONS);

// ── Combined answer-review script (Option 1 — preferred POC): reveal all answers in playlist order, one MP3 ──
export interface AnswerReviewLine { order: number; categoryLabel: string; prompt: string; answer: string; line: string }
export interface AnswerReviewScript { file: string; intro: string; lines: AnswerReviewLine[]; script: string }

/** Light, varied lead-ins so the combined reveal doesn't sound robotic (direction only — NOT generated audio). */
const REVIEW_LEADINS = [
  "For question one, the answer was",
  "Question two — the answer is",
  "Onto question three, that was",
  "Question four — the answer we wanted was",
  "And finally, question five — the answer is",
];

export function buildAnswerReviewScript(playlist: BankQuestion[] = DEMO_PLAYLIST, demoId = DEMO_ID): AnswerReviewScript {
  const intro = "Right, pens down everyone — let's go through tonight's answers in order.";
  const lines: AnswerReviewLine[] = playlist.map((q, i) => ({
    order: q.order, categoryLabel: q.categoryLabel, prompt: q.prompt, answer: q.answer,
    line: `${REVIEW_LEADINS[i] ?? `Question ${q.order} — the answer is`} ${q.answer}.`,
  }));
  const script = [intro, ...lines.map((l) => l.line), "Tot up your scores — and let's find tonight's winners."].join(" ");
  return { file: answerReviewKey(demoId), intro, lines, script };
}

/** Answer-review tone guidance (direction only). */
export const ANSWER_REVIEW_TONE = [
  "Reveal answers in playlist order — never during the question phase.",
  "Sound natural, not robotic — vary the lead-in for each question.",
  "Keep it tight; add a one-line bit of colour only where it helps.",
  "Lift the sponsor question's answer with the sponsor's name where relevant.",
];
export const ANSWER_REVIEW_EXAMPLES = [
  "For question one, the answer was…",
  "Question two — this one caught a few people out…",
  "And for the football question, the answer was…",
  "If you had Queen for question three, you're off to a good start.",
];

// ── ElevenLabs production list for the selected demo playlist (one row per cue to record) ──
export type ProductionStatus = "ready to record" | "needs copy" | "placeholder";
export interface ProductionCue {
  cueId: string;
  filename: string;
  phase: string;
  purpose: string;
  script: string;
  status: ProductionStatus;
  tone: string;
}

/** Winner template — uses the table/team NUMBER, never the entered team name. */
export const WINNER_TEMPLATE = "And tonight's winners are… Team {number}! Brilliantly played — thanks to {sponsor}, and goodnight.";

export function buildProductionList(playlist: BankQuestion[] = DEMO_PLAYLIST, demoId = DEMO_ID): ProductionCue[] {
  const review = buildAnswerReviewScript(playlist, demoId);
  const cues: ProductionCue[] = [
    { cueId: "intro", filename: "event-intro.mp3", phase: "Intro", purpose: "Welcome + sponsor + how-to", script: "Good evening and welcome… (preset ai.eventIntro)", status: "ready to record", tone: "Warm pub host, build to 'let's play!'" },
    { cueId: "howto", filename: `playlist-${demoId}-how-to-play.mp3`, phase: "Opening", purpose: "How to play / explanation", script: "Scan the QR, name your team, one answer per team…", status: "needs copy", tone: "Clear, friendly, instructional" },
  ];
  for (const q of playlist) {
    cues.push({ cueId: `q${pad(q.order)}-readout`, filename: q.readoutFile, phase: "Question phase", purpose: `Read Q${q.order} (${q.categoryLabel})`, script: q.readoutScript, status: "ready to record", tone: "Clear; vary phrasing across questions" });
  }
  cues.push({ cueId: "answer-review", filename: review.file, phase: "Answer-review phase", purpose: "Reveal all 5 answers in order (combined)", script: review.script, status: "ready to record", tone: "Natural, varied lead-ins; not robotic" });
  cues.push({ cueId: "winner", filename: "winner.mp3", phase: "Result", purpose: "Winner announcement by team number", script: WINNER_TEMPLATE, status: "ready to record", tone: "Celebratory; say 'Team {number}', not a team name" });
  cues.push({ cueId: "outro", filename: `playlist-${demoId}-outro.mp3`, phase: "Closing", purpose: "Thanks + next event", script: "Thanks for playing — next quiz is…", status: "placeholder", tone: "Warm sign-off + nudge to return" });
  return cues;
}
