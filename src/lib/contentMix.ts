/**
 * Venue content mix (operator-only, on-device). A percentage profile for the quiz CATEGORY balance of the
 * prepared demo — "this venue wants 60% sport". It is a PLANNED / PROPOSED content profile: saved with the brief,
 * summarised on operator + client surfaces, and used to build a PREVIEW quiz from a seeded source-side pool. It
 * does NOT regenerate or reorder the live seeded question bank, and never touches gameplay/scoring/DB/schema.
 *
 * Operator-facing categories map onto the existing question `kind` values. Music, Picture round and Video round
 * are SEPARATE categories. Tiebreak / bonus is an optional add-on OUTSIDE the main 100% slider mix.
 * On-device only: no schema, no Supabase, no hosted persistence.
 */
import { QUESTION_POOL, type PoolQuestion } from "../demo/questionPool";
import type { SetupModeId } from "../demo/kpiModel";

export type ContentCategoryId = "general" | "sport" | "music" | "local" | "geography" | "picture" | "video" | "sponsor";

export interface ContentCategory { id: ContentCategoryId; label: string; kinds: string[]; media?: boolean }

export const CONTENT_CATEGORIES: ContentCategory[] = [
  { id: "general", label: "General knowledge", kinds: ["text"] },
  { id: "sport", label: "Sport / football", kinds: ["sport", "football"] },
  { id: "music", label: "Music", kinds: ["music"] },
  { id: "local", label: "Local / venue", kinds: ["local"] },
  { id: "geography", label: "Geography / culture", kinds: ["geography"] },
  { id: "picture", label: "Picture round", kinds: ["picture"], media: true },
  { id: "video", label: "Video round", kinds: ["video"], media: true },
  { id: "sponsor", label: "Sponsor / brand", kinds: ["sponsored"] },
];

export type ContentMix = Record<ContentCategoryId, number>;

const ORDER: ContentCategoryId[] = CONTENT_CATEGORIES.map((c) => c.id);
const LABEL: Record<ContentCategoryId, string> = Object.fromEntries(CONTENT_CATEGORIES.map((c) => [c.id, c.label])) as Record<ContentCategoryId, string>;
export const categoryLabel = (id: ContentCategoryId) => LABEL[id];

/** Sponsor/brand above this share is flagged (keeps the night a quiz, not an advert). */
export const SPONSOR_WARN_PCT = 15;
/** Picture+Video share above this is flagged for media/asset readiness. */
export const MEDIA_WARN_PCT = 25;

export interface ContentMixPreset { id: string; label: string; description: string; mix: ContentMix }

export const CONTENT_MIX_PRESETS: ContentMixPreset[] = [
  { id: "general_pub", label: "General pub quiz", description: "Balanced mix — the default night.",
    mix: { general: 30, sport: 15, music: 15, local: 15, geography: 15, picture: 5, video: 0, sponsor: 5 } },
  { id: "sports_bar", label: "Sports bar", description: "Sport-led for a match-day crowd.",
    mix: { general: 10, sport: 60, music: 10, local: 10, geography: 5, picture: 0, video: 0, sponsor: 5 } },
  { id: "music_night", label: "Music night", description: "Music-led for a live-music venue.",
    mix: { general: 15, sport: 5, music: 50, local: 10, geography: 5, picture: 5, video: 5, sponsor: 5 } },
  { id: "neighbourhood", label: "Local neighbourhood pub", description: "More local/community questions for the regulars.",
    mix: { general: 20, sport: 10, music: 10, local: 35, geography: 15, picture: 5, video: 0, sponsor: 5 } },
  { id: "brewery_launch", label: "Brewery launch", description: "A controlled amount of sponsor/product content.",
    mix: { general: 25, sport: 15, music: 15, local: 10, geography: 10, picture: 5, video: 5, sponsor: 15 } },
  { id: "matchday", label: "Matchday / football", description: "Football-heavy night tied to a fixture.",
    mix: { general: 10, sport: 55, music: 5, local: 10, geography: 5, picture: 5, video: 5, sponsor: 5 } },
  { id: "popup", label: "Pop-up / event", description: "Varied, media-rich night for a special event.",
    mix: { general: 15, sport: 15, music: 15, local: 10, geography: 10, picture: 15, video: 15, sponsor: 5 } },
];

export const DEFAULT_CONTENT_MIX_PRESET = "general_pub";
export const presetById = (id?: string) => CONTENT_MIX_PRESETS.find((p) => p.id === id);
export function defaultContentMix(): ContentMix { return { ...presetById(DEFAULT_CONTENT_MIX_PRESET)!.mix }; }

const KEY = "ppn_content_mix";
export function getContentMix(): ContentMix | null {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as ContentMix) : null; } catch { return null; }
}
export function setContentMix(mix: ContentMix) { try { localStorage.setItem(KEY, JSON.stringify(mix)); } catch { /* ignore */ } }
export function clearContentMix() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
export function hasContentMix(): boolean { return getContentMix() !== null; }

export function totalContentMix(mix: ContentMix): number { return ORDER.reduce((s, k) => s + (Number(mix[k]) || 0), 0); }
export function isContentMixValid(mix: ContentMix): boolean { return totalContentMix(mix) === 100; }

/** Scale to total 100 (largest-remainder), preserving relative weights. A zero mix → the default preset. */
export function normaliseContentMix(mix: ContentMix): ContentMix {
  const total = totalContentMix(mix);
  if (total === 100) return { ...mix };
  if (total <= 0) return defaultContentMix();
  const scaled = ORDER.map((k) => ({ k, raw: ((Number(mix[k]) || 0) / total) * 100 }));
  const out = {} as ContentMix;
  let assigned = 0;
  scaled.forEach((e) => { const f = Math.floor(e.raw); out[e.k] = f; assigned += f; });
  let remaining = 100 - assigned;
  [...scaled].sort((a, b) => (b.raw % 1) - (a.raw % 1)).forEach((e) => { if (remaining > 0) { out[e.k]++; remaining--; } });
  return out;
}

export interface CategoryShare { id: ContentCategoryId; label: string; pct: number }
export function topCategories(mix: ContentMix, n = 3): CategoryShare[] {
  return CONTENT_CATEGORIES.map((c) => ({ id: c.id, label: c.label, pct: Number(mix[c.id]) || 0 }))
    .filter((x) => x.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, n);
}

/** Short summary string for UI, e.g. "Sport / football 60%, Music 10%, Sponsor / brand 5%". */
export function contentMixSummary(mix: ContentMix, n = 3): string {
  return topCategories(mix, n).map((c) => `${c.label} ${c.pct}%`).join(", ");
}

/** Preset id whose mix exactly matches (for naming the saved mix), else undefined → "Custom". */
export function matchPresetId(mix: ContentMix): string | undefined {
  return CONTENT_MIX_PRESETS.find((p) => ORDER.every((k) => p.mix[k] === mix[k]))?.id;
}

export interface QuestionShare { id: ContentCategoryId; label: string; count: number; pct: number }
/** Expected question composition for an N-question quiz (largest-remainder so counts sum to N). */
export function estimateQuestionComposition(mix: ContentMix, totalQuestions: number): QuestionShare[] {
  const t = Math.max(0, Math.round(totalQuestions));
  const denom = Math.max(1, totalContentMix(mix));
  const raw = ORDER.map((k) => ({ k, raw: ((Number(mix[k]) || 0) / denom) * t }));
  const base = {} as Record<ContentCategoryId, number>;
  let assigned = 0;
  raw.forEach((e) => { const f = Math.floor(e.raw); base[e.k] = f; assigned += f; });
  let remaining = t - assigned;
  [...raw].sort((a, b) => (b.raw % 1) - (a.raw % 1)).forEach((e) => { if (remaining > 0) { base[e.k]++; remaining--; } });
  return CONTENT_CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: base[c.id], pct: Number(mix[c.id]) || 0 }));
}

/** Operator-only warnings (total != 100, sponsor too high, media-heavy needing assets). */
export function contentMixWarnings(mix: ContentMix): string[] {
  const w: string[] = [];
  const t = totalContentMix(mix);
  if (t !== 100) w.push(`Total is ${t}% — the main categories must add up to 100%.`);
  if ((Number(mix.sponsor) || 0) > SPONSOR_WARN_PCT) w.push(`Sponsor / brand is ${mix.sponsor}% — keep it at or below ${SPONSOR_WARN_PCT}% so the night still feels like a quiz, not an advert.`);
  const media = (Number(mix.picture) || 0) + (Number(mix.video) || 0);
  if (media > MEDIA_WARN_PCT) w.push(`Picture + Video is ${media}% — a media-heavy night needs TV/asset readiness (images and clips prepared).`);
  return w;
}

// ── Preview quiz builder (from the seeded source-side pool) ──────────────────────────────────────────
export type PreviewFormat = "standard" | "picture" | "video" | "sponsor" | "tiebreak";
export interface PreviewQuestion { seq: number; categoryId: ContentCategoryId | "tiebreak"; categoryLabel: string; format: PreviewFormat; prompt: string; answer: string; fallback?: boolean; needs?: string }
export interface PreviewQuiz { questions: PreviewQuestion[]; tiebreak: PreviewQuestion | null; warnings: string[]; composition: QuestionShare[] }

const formatOf = (id: ContentCategoryId | "tiebreak"): PreviewFormat =>
  id === "picture" ? "picture" : id === "video" ? "video" : id === "sponsor" ? "sponsor" : id === "tiebreak" ? "tiebreak" : "standard";
const poolByCategory = (id: ContentCategoryId | "tiebreak"): PoolQuestion[] => QUESTION_POOL.filter((q) => q.category === id);
const subSponsor = (prompt: string, sponsor: string) => prompt.replace(/\{sponsor\}/g, sponsor);

/**
 * Build a PROPOSED quiz preview from the seeded pool. Deterministic (seed-offset, no randomness). When a category
 * lacks enough seeded questions, the shortfall is filled from General knowledge and flagged + warned. The result
 * is interleaved round-robin so it reads like a real quiz. Operator/PPN can override the final selection before
 * an event — this never writes to the live question DB.
 */
export function buildPreviewQuiz(mix: ContentMix, totalQuestions: number, opts?: { sponsorName?: string; includeTiebreak?: boolean; seed?: number; setupMode?: SetupModeId }): PreviewQuiz {
  const sponsor = opts?.sponsorName?.trim() || "the sponsor";
  const mode = opts?.setupMode;
  const seed = Math.max(0, Math.floor(opts?.seed ?? 0));
  const composition = estimateQuestionComposition(mix, totalQuestions);
  const used = new Set<string>();
  const warnings: string[] = [];

  const buckets: Record<string, { q: PoolQuestion; fallback?: boolean }[]> = {};
  for (const c of composition) {
    const bucket: { q: PoolQuestion; fallback?: boolean }[] = [];
    if (c.count > 0) {
      const pool = poolByCategory(c.id);
      const start = pool.length ? seed % pool.length : 0;
      for (let i = 0; i < pool.length && bucket.length < c.count; i++) {
        const q = pool[(start + i) % pool.length];
        if (!used.has(q.id)) { used.add(q.id); bucket.push({ q }); }
      }
      if (bucket.length < c.count) {
        const need = c.count - bucket.length;
        const gpool = poolByCategory("general");
        let filled = 0;
        for (const q of gpool) { if (filled >= need) break; if (!used.has(q.id)) { used.add(q.id); bucket.push({ q, fallback: true }); filled++; } }
        for (let i = 0; filled < need && pool.length; i++) { bucket.push({ q: pool[i % pool.length], fallback: true }); filled++; }
        warnings.push(`${c.label} needs ${c.count} questions but only ${pool.length} are seeded — ${need} filled from General knowledge.`);
      }
    }
    buckets[c.id] = bucket;
  }

  // Round-robin interleave across the categories that have questions.
  const active = composition.filter((c) => c.count > 0).map((c) => c.id);
  const pos: Record<string, number> = {};
  const questions: PreviewQuestion[] = [];
  let progressed = true;
  while (questions.length < totalQuestions && progressed) {
    progressed = false;
    for (const cat of active) {
      const b = buckets[cat]; const p = pos[cat] ?? 0;
      if (p < b.length) {
        const { q, fallback } = b[p]; pos[cat] = p + 1; progressed = true;
        const needs = mode ? categoryNeeds(cat, mode) : undefined;
        questions.push({ seq: questions.length + 1, categoryId: cat, categoryLabel: categoryLabel(cat), format: formatOf(cat), prompt: subSponsor(q.prompt, sponsor), answer: q.answer, fallback, needs });
        if (questions.length >= totalQuestions) break;
      }
    }
  }

  let tiebreak: PreviewQuestion | null = null;
  if (opts?.includeTiebreak) {
    const tb = poolByCategory("tiebreak");
    if (tb.length) { const q = tb[seed % tb.length]; tiebreak = { seq: 0, categoryId: "tiebreak", categoryLabel: "Tiebreak / bonus", format: "tiebreak", prompt: q.prompt, answer: q.answer }; }
  }
  return { questions, tiebreak, warnings, composition };
}

/** The content mix in effect: the brief's saved mix → the standalone helper → the default preset. */
export function resolveContentMix(brief: { contentMix?: ContentMix } | null): ContentMix {
  return brief?.contentMix ?? getContentMix() ?? defaultContentMix();
}

// ── Setup-mode compatibility (which categories the chosen venue setup can run) ───────────────────────
export interface CategoryCompat { ok: boolean; needs?: string; fix?: string }

/** Whether a category is runnable on the given setup mode (display-only planning rule, never blocks gameplay). */
export function categoryCompat(id: ContentCategoryId, mode: SetupModeId): CategoryCompat {
  if (mode === "tv_audio") return { ok: true };
  if (id === "video") return { ok: false, needs: "Needs TV/display", fix: "Video round needs TV/display support. Switch to TV + audio or reduce Video round to 0%." };
  if (id === "picture") {
    return mode === "audio_only"
      ? { ok: false, needs: "Needs TV/display or phone image", fix: "Picture round needs a display, or images delivered to player phones. Switch to TV + audio or reduce Picture round to 0%." }
      : { ok: false, needs: "Needs phone image", fix: "Picture round needs player-phone image support — confirm phones can show it, or reduce Picture round to 0%." };
  }
  if (id === "music" && mode === "phones_hosted") return { ok: false, needs: "Needs shared audio", fix: "Music/audio questions need a shared sound system. Switch to Audio-only / TV + audio, or reduce Music to 0%." };
  return { ok: true };
}

/** The "Needs …" badge for an incompatible category on this setup mode (or undefined when compatible). */
export function categoryNeeds(id: ContentCategoryId, mode: SetupModeId): string | undefined {
  const c = categoryCompat(id, mode);
  return c.ok ? undefined : c.needs;
}

/** Operator-only warnings: every category with a >0% share that the chosen setup mode can't run cleanly. */
export function contentMixSetupWarnings(mix: ContentMix, mode: SetupModeId): string[] {
  return CONTENT_CATEGORIES
    .filter((c) => (Number(mix[c.id]) || 0) > 0 && !categoryCompat(c.id, mode).ok)
    .map((c) => categoryCompat(c.id, mode).fix!)
    .filter(Boolean);
}
