/**
 * Generic-cue SCRIPT VARIANT BANKS (source-only; NO generation, NO TTS, NO runtime change).
 *
 * The biggest "this was made by AI" tell is hearing the SAME line every time. So the high-frequency generic cues
 * (intro openers, repeat-the-question, answer-review lead-ins, between-question transitions) each get a bank of
 * 6–8 varied lines for the operator to RECORD as separate MP3 takes. This is a script bank to record from — the
 * app does not rotate or play these at runtime in this slice (rotation is parked, see UI note).
 *
 * Filenames are namespaced `generic-*` so they cannot collide with playlist (`playlist-demo-*`) or live-game
 * (`question-NN.mp3`) cues.
 */
import { SCRIPT_STYLES } from "./quizPlaylist";
import { ANSWER_REVIEW_LEADINS } from "./questionBank";

export type VariantColour = "generic" | "venue" | "sport" | "music" | "picture";
/** `file` present → record as its own MP3. Absent → a phrasing woven INTO another file (e.g. the combined review). */
export interface ScriptVariant { file?: string; text: string; colour: VariantColour }
export interface VariantBank { id: string; label: string; blurb: string; variants: ScriptVariant[] }

const pad = (n: number) => String(n).padStart(2, "0");

// ── Intro openers — one per script style, so the welcome isn't a fixed line ──
const INTRO_OPENER_LINES: Record<string, string> = {
  warm: "Good evening everyone, and a very warm welcome to tonight's quiz!",
  sport: "Right, line 'em up — welcome to quiz night, let's get a result on the board!",
  dry: "Evening. You came out for this. Brave. Welcome to the quiz.",
  family: "Hello everyone, big and small — welcome along to tonight's family quiz night!",
  sponsor: "Good evening! Tonight's quiz is brought to you by {sponsor} — let's get started.",
  fast: "Evening all — phones out, teams named, here we go, welcome to the quiz!",
};
const INTRO_OPENERS: ScriptVariant[] = SCRIPT_STYLES.map((s) => ({
  file: `generic-intro-${s.id}.mp3`, text: INTRO_OPENER_LINES[s.id] ?? `Welcome to tonight's quiz! (${s.label})`, colour: "generic",
}));

// ── Repeat / read-again — the highest-value pool (8): generic + venue colour + category colour ──
const REPEAT_LINES: { text: string; colour: VariantColour }[] = [
  { text: "I'll read that one more time…", colour: "generic" },
  { text: "Here's the question again…", colour: "generic" },
  { text: "One more time for the room…", colour: "generic" },
  { text: "No rush — I'll say it again, nice and slow…", colour: "generic" },
  { text: "The table by the bar might want this one again…", colour: "venue" },
  { text: "I can see a few puzzled faces — let me repeat it…", colour: "venue" },
  { text: "For all you football fans out there, here it is again…", colour: "sport" },
  { text: "Music lovers, listen in — once more…", colour: "music" },
];
const REPEAT_VARIANTS: ScriptVariant[] = REPEAT_LINES.map((l, i) => ({ file: `generic-repeat-${pad(i + 1)}.mp3`, text: l.text, colour: l.colour }));

// ── Answer-review lead-ins — the phrasings the ONE combined answer-review file rotates through (not separate MP3s) ──
const REVEAL_LEADINS: ScriptVariant[] = ANSWER_REVIEW_LEADINS.map((t) => ({ text: t, colour: "generic" }));

// ── Transitions / banter (6) — between-question filler so the night breathes ──
const TRANSITION_LINES = [
  "Onto the next one…",
  "Keep those answer sheets handy — moving on…",
  "Good stuff — let's keep it rolling…",
  "Next up, and this is a nice one…",
  "Right, eyes back to me — here we go…",
  "Plenty more to play for — next question…",
];
const TRANSITIONS: ScriptVariant[] = TRANSITION_LINES.map((t, i) => ({ file: `generic-transition-${pad(i + 1)}.mp3`, text: t, colour: "generic" }));

export const VARIANT_BANKS: VariantBank[] = [
  { id: "intro", label: "Intro openers", blurb: "One opener per host style — vary the welcome so it's never the same line.", variants: INTRO_OPENERS },
  { id: "repeat", label: "Repeat / read-again", blurb: "Vary how you repeat a question — generic, venue colour and category colour. Record all of these.", variants: REPEAT_VARIANTS },
  { id: "reveal", label: "Answer-review lead-ins", blurb: "Phrasings the single combined answer-review file rotates through ({n}=question number, {answer}=answer) — woven into playlist-demo-answer-review.mp3, not separate MP3s.", variants: REVEAL_LEADINS },
  { id: "transition", label: "Transitions / banter", blurb: "Short between-question fillers so the night breathes.", variants: TRANSITIONS },
];

/** Recording guidance to keep recorded audio from sounding templated (direction only — NOT generation). */
export const VARIETY_RECORDING_TIPS = [
  "Record every line in a bank — variety across takes is what stops it sounding templated.",
  "Where a line repeats, record 2–3 different takes and alternate them.",
  "Match the colour to the moment — use the sport line for a sport question, the venue line for the room.",
  "Keep energy and pace varied; avoid reading every line at the exact same cadence.",
];

export const variantCount = (id: string): number => VARIANT_BANKS.find((b) => b.id === id)?.variants.length ?? 0;
