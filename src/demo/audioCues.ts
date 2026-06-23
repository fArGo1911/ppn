/**
 * Scalable pub-quiz audio/script cue TAXONOMY (POC asset model — NOT a CMS, NO generation, NO TTS).
 * The operator supplies their own MP3 files + script text; this module only DESCRIBES the cue families and
 * which cues can be uploaded in-app today vs. which are reserved structure / file-drop only.
 *
 * UK-style flow this model assumes:
 *   Question phase  → the host reads ALL questions in a round; teams answer; NO answer is revealed yet.
 *   Answer-review   → later, the host reviews answers question by question and scores are updated.
 * So "answer reveal" cues belong to the answer-review phase, never straight after each question.
 *
 * Schema note: in-app upload is limited to the asset_type values allowed by the ppn_assets CHECK constraint
 * (no migration in this slice). Cues without a `field`/`type` are reference-only (script + filename convention).
 */
import type { AssetPack } from "./assetPack";
import type { AssetType } from "../lib/ppnAssets";
import type { DemoBrand } from "./brand";

export type CueFamily = "global" | "round" | "question" | "review" | "sponsor";
/** live = host triggers it now · stored-only = uploads/previews here, no host trigger (or fallback only) · not-wired = reference structure only. */
export type CueStatus = "live" | "stored-only" | "not-wired";

export interface CueFamilyDef { id: CueFamily; label: string; blurb: string }
export const CUE_FAMILIES: CueFamilyDef[] = [
  { id: "global", label: "Global event cues", blurb: "Played once across the evening — open, explain, pause, celebrate, close." },
  { id: "round", label: "Round / category cues", blurb: "Top & tail each round, introduce a category, and open the answer-review." },
  { id: "question", label: "Question readout cues", blurb: "Read during the question phase. The host reads ALL questions first — no answers yet." },
  { id: "review", label: "Answer-review cues", blurb: "Played later, in the answer-review phase, reviewing answers question by question — never straight after each question." },
  { id: "sponsor", label: "Sponsor / special-question cues", blurb: "Reserved structure for a future sponsored-question feature (branding + audio). Not a live game mechanic in this POC." },
];

export interface AudioCueDef {
  family: CueFamily;
  key: string;
  label: string;
  tone: string;
  where: string;
  status: CueStatus;
  /** Present → in-app uploadable (maps to a localStorage override field + an allowed storage asset_type). */
  field?: keyof AssetPack;
  type?: AssetType;
  /** brand.audio.* field the host/TV reads (fallback after a per-question file, for the wired cues). */
  audioField?: keyof DemoBrand["audio"];
  /** Preset reference script (brand.ai key) — shown read-only so the operator can record an MP3 from it. */
  scriptKey?: keyof DemoBrand["ai"];
  /** Static reference hint when there is no preset script for the cue. */
  scriptHint?: string;
}

export const AUDIO_CUES: AudioCueDef[] = [
  // ── Global event cues ──
  { family: "global", key: "intro", label: "Intro / welcome", tone: "Warm, welcoming, energetic", where: "Host · intro (Replay / Preview intro)", status: "live", field: "eventIntroAudioUrl", type: "event_intro_audio", audioField: "aiEventIntroAudioUrl", scriptKey: "eventIntro" },
  { family: "global", key: "howto", label: "How to play / competition explanation", tone: "Clear, friendly, instructional", where: "Reference — part of the intro today; no separate host trigger", status: "not-wired", scriptHint: "Scan the QR on your table, name your team and answer on your phone — one shared answer per team. Points each round, a tie-breaker at the end." },
  { family: "global", key: "sponsor", label: "Sponsor message", tone: "Upbeat brand mention, not salesy", where: "Host · sponsored question (Sponsor message)", status: "live", field: "sponsorMessageAudioUrl", type: "sponsor_audio_message", audioField: "sponsorAudioMessageUrl", scriptKey: "sponsoredIntro" },
  { family: "global", key: "pause", label: "Pause / intermission", tone: "Relaxed, short", where: "Reference — no host pause trigger yet", status: "not-wired", scriptKey: "intermission" },
  { family: "global", key: "winner", label: "Winner announcement", tone: "Celebratory — announce the TABLE NUMBER, not the team name", where: "Host · end (Play winner)", status: "live", field: "winnerAudioUrl", type: "winner_audio", audioField: "aiWinnerAnnouncementAudioUrl", scriptKey: "winner" },
  { family: "global", key: "outro", label: "Outro / closing / next-event CTA", tone: "Warm sign-off + a nudge to come back", where: "Reference — no separate closing trigger yet", status: "not-wired", scriptHint: "That's last orders on tonight's quiz — thanks for playing, get home safe, and we'll see you next week." },

  // ── Round / category cues ──
  { family: "round", key: "roundIntro", label: "Round intro", tone: "Brisk, sets the round", where: "Uploads & previews here; no host round-intro trigger yet", status: "stored-only", field: "roundIntroAudioUrl", type: "round_intro_audio", audioField: "aiRoundIntroAudioUrl", scriptKey: "roundIntro" },
  { family: "round", key: "categoryIntro", label: "Category intro", tone: "Category-flavoured, light", where: "Reference — per-category colour; not wired", status: "not-wired", scriptHint: "Next up — the {category} round. Eyes down, pens ready." },
  { family: "round", key: "roundWrap", label: "Round wrap-up", tone: "Brief", where: "Reference — not wired", status: "not-wired", scriptHint: "That's the round done — hold your answers, we'll review them shortly." },
  { family: "round", key: "reviewIntro", label: "Answer-review intro", tone: "Settling, clear — opens the review phase", where: "Reference — opens the answer-review phase; not wired", status: "not-wired", scriptHint: "Pens down, please — let's go back through the answers." },

  // ── Question readout cues (question phase) ──
  { family: "question", key: "questionReadout", label: "Question readout (generic)", tone: "Clear; vary the phrasing across repeats", where: "Host · question — fallback only (the per-question file question-NN.mp3 is played first)", status: "stored-only", field: "questionReadoutAudioUrl", type: "question_readout_audio", audioField: "aiQuestionReadoutAudioUrl", scriptKey: "questionReadout" },
  { family: "question", key: "questionRepeat", label: "Repeat / read-again", tone: "Light humour, category colour", where: "Reference — varied read-again lines; not a separate file", status: "not-wired", scriptHint: "Here's the question again… / One more time… / For the football fans in the room…" },

  // ── Answer-review cues (answer-review phase, not during question play) ──
  { family: "review", key: "answerReveal", label: "Answer reveal", tone: "Clear, builds to the answer", where: "Host · answer-review (reveal) — fallback only (per-question reveal-NN.mp3 first); never auto-plays after a question", status: "stored-only", field: "answerRevealAudioUrl", type: "answer_reveal_audio", audioField: "aiAnswerRevealAudioUrl", scriptKey: "answerReveal" },
  { family: "review", key: "answerCommentary", label: "Answer explanation / commentary", tone: "Informative, light", where: "Reference — optional colour during review; not wired", status: "not-wired", scriptHint: "…and a point to anyone who also accepted the longer answer there." },

  // ── Sponsor / special-question cues (reserved structure) ──
  { family: "sponsor", key: "spQIntro", label: "Sponsor question intro", tone: "Branded, builds anticipation", where: "Reserved — future sponsored-question feature", status: "not-wired", scriptHint: "And now the {sponsor} question of the night…" },
  { family: "sponsor", key: "spQReadout", label: "Sponsor question readout", tone: "Clear, branded", where: "Reserved — future sponsored-question feature", status: "not-wired", scriptHint: "{sponsor} want to know…" },
  { family: "sponsor", key: "spReveal", label: "Sponsor answer / reveal", tone: "Branded reveal", where: "Reserved — future sponsored-question feature", status: "not-wired", scriptHint: "The {sponsor} answer was…" },
  { family: "sponsor", key: "spOffer", label: "Sponsor offer / message", tone: "Offer + responsible note", where: "Reserved — future sponsored-question feature", status: "not-wired", scriptHint: "Tonight {sponsor} are offering… please drink responsibly." },
];

/** Script-style rules the operator should follow when writing/recording cue audio. */
export const SCRIPT_STYLE_RULES = [
  "Vary repeated phrases — don't read every question the same way.",
  "Use humour lightly and add category-specific colour.",
  "Announce winners by table number (e.g. “Team 17”), not the entered team name.",
  "Avoid reading out user-created team names aloud.",
];

/** Reference examples of varied repeat/read-again phrasing (guidance only — not generated final content). */
export const REPEAT_PHRASE_EXAMPLES = [
  "I'll repeat the question…",
  "Here's the question again…",
  "One more time…",
  "For all you football fans out there…",
  "The table by the bar might need this one again…",
];

/** Winner script reference — uses the TABLE/TEAM NUMBER, never the entered team name. */
export const WINNER_SCRIPT_REF = "And tonight's winners are… Team {number}! Brilliantly played — thanks to {sponsor}, and goodnight.";
/** Parked follow-up: team-number display is not yet assigned/shown (team displays use the entered name). */
export const TEAM_NUMBER_FOLLOWUP = "Follow-up: assign & display a table/team number for every team so audio can announce winners by number. Team displays currently use the entered team name.";

/** Per-question audio filename convention (deployed under the preset's audio base dir; not an in-app upload). */
export const QUESTION_FILE_CONVENTION = { readout: "question-NN.mp3", reveal: "reveal-NN.mp3" };
