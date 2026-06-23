/**
 * Staged demo quiz PLAN (operator-only, on-device). Phase 10A: this captures a PREPARED/proposed tailored quiz —
 * a snapshot of the content-mix preview the operator explicitly saved. It is NOT applied to the live demo: the
 * live /host, /tv/DEMO and /play/DEMO still read the default seeded questions from local Supabase. Writing the
 * tailored questions into real ppn_questions rows (so reveal/scoreboard run them) is the Phase 10B runtime step.
 *
 * `runtimeApplied` is always false here. On-device only: localStorage, no Supabase, no schema. Reversible.
 */
import { buildPreviewQuiz, type ContentMix, type PreviewQuestion } from "./contentMix";
import type { SetupModeId } from "../demo/kpiModel";

export interface StagedDemoQuiz {
  id: string;
  source: "content_mix_preview";
  createdAt: string;
  contentMixPreset?: string;
  quizLength: number;
  includeTiebreak: boolean;
  setupMode: SetupModeId;
  clientName?: string;
  sponsorName?: string;
  questions: PreviewQuestion[];
  tiebreak: PreviewQuestion | null;
  warnings: string[];
  /** "prepared" = staged only; never applied to the live runtime in Phase 10A. */
  status: "prepared";
  /** Always false until the Phase 10B DB-backed replacement step writes real ppn_questions rows + verifies. */
  runtimeApplied: false;
}

const KEY = "ppn_staged_demo_quiz";

export function getStagedDemoQuiz(): StagedDemoQuiz | null {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as StagedDemoQuiz) : null; } catch { return null; }
}
export function setStagedDemoQuiz(plan: StagedDemoQuiz) { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* ignore */ } }
export function clearStagedDemoQuiz() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
export function hasStagedDemoQuiz(): boolean { return getStagedDemoQuiz() !== null; }

export interface StagePlanInput {
  mix: ContentMix;
  quizLength: number;
  includeTiebreak: boolean;
  setupMode: SetupModeId;
  contentMixPreset?: string;
  clientName?: string;
  sponsorName?: string;
  now: string; // pass new Date().toISOString() from the caller (display-only timestamp)
}

/** Build a staged plan snapshot from the current content-mix selection (the saved action, not live dragging). */
export function buildStagedPlan(input: StagePlanInput): StagedDemoQuiz {
  const preview = buildPreviewQuiz(input.mix, input.quizLength, {
    sponsorName: input.sponsorName, includeTiebreak: input.includeTiebreak, setupMode: input.setupMode, seed: 0,
  });
  return {
    id: `plan-${input.now}`,
    source: "content_mix_preview",
    createdAt: input.now,
    contentMixPreset: input.contentMixPreset,
    quizLength: input.quizLength,
    includeTiebreak: input.includeTiebreak,
    setupMode: input.setupMode,
    clientName: input.clientName,
    sponsorName: input.sponsorName,
    questions: preview.questions,
    tiebreak: preview.tiebreak,
    warnings: preview.warnings,
    status: "prepared",
    runtimeApplied: false,
  };
}
