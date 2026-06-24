/**
 * ElevenLabs PRODUCTION PACK — metadata/source-of-truth for recording the demo audio (docs export only).
 *
 * This generates a clean "one row = one MP3" recording plan from the existing playlist / script source, so MP3s
 * can be produced in ElevenLabs without hand-pasting and naming each one. The app does NOT generate audio, call
 * any TTS/ElevenLabs API, or hold any API key — these are scripts + filenames for a human to record and drop in.
 *
 * Recording model is two-part assembly (NOT tiny fragments): a lead-in file + a content file.
 *   Question phase:      [question lead-in] + [question readout]
 *   Answer-review phase: [answer lead-in]   + [answer content]   (a-leadin-none → play the answer file only)
 *
 * Filenames use the non-colliding playlist namespace (playlist-demo-*) + clear global/variant names — never the
 * ambiguous live-game question-NN.mp3 / reveal-NN.mp3.
 */
import { DEMO_PLAYLIST } from "./quizPlaylist";
import { WINNER_TEMPLATE, buildAnswerReviewScript } from "./questionBank";
import { VARIANT_BANKS } from "./scriptVariants";

export type CueFamily =
  | "global" | "question-leadin" | "question-readout" | "answer-leadin" | "answer-content"
  | "answer-review-assembly" | "winner" | "outro" | "transition";
export type CuePhase = "intro" | "how-to-play" | "question-phase" | "answer-review-phase" | "winner" | "outro";
export type Priority = "P1 core demo" | "P2 useful variant" | "P3 record later";
export type RecordingStatus = "ready-to-record" | "needs-copy" | "placeholder";
export type PlaybackType = "standalone" | "lead-in" | "question-content" | "answer-content" | "assembly-only";

export interface ProductionRow {
  cueId: string;
  filename: string | null;   // null → metadata only (noFile)
  noFile: boolean;
  family: CueFamily;
  phase: CuePhase;
  scriptText: string;
  voiceStyle: string;
  toneNotes: string;
  deliveryNotes: string;
  market: string;
  venue: string;
  sponsor: string;
  product: string;
  language: string;
  accent: string;
  priority: Priority;
  recordingStatus: RecordingStatus;
  usedBy: string;
  playbackType: PlaybackType;
  /** Reusable across markets, or specific to the active market (mentions sponsor/product/venue). */
  scope: "reusable" | "market-specific";
  /** For how-to-play variants: which product setup mode this script represents. */
  setupMode?: "tv_audio" | "audio_only" | "local_host";
  notes: string;
}

// ── Production / recording context (Part G). UK is active; DE/SE are reference/future. ──
export interface MarketContext { market: string; active: boolean; venue: string; sponsor: string; product: string; language: string; accent: string }
export const MARKET_CONTEXTS: MarketContext[] = [
  { market: "UK", active: true, venue: "O'Learys", sponsor: "Fuller's", product: "London Pride", language: "en-GB", accent: "British (England)" },
  { market: "Germany", active: false, venue: "O'Learys", sponsor: "Krombacher", product: "Krombacher Pils", language: "de-DE", accent: "German" },
  { market: "Sweden", active: false, venue: "O'Learys", sponsor: "Spendrups", product: "Norrlands Guld", language: "sv-SE", accent: "Swedish" },
];
const ACTIVE = MARKET_CONTEXTS[0];

export const PRODUCTION_CONTEXT = {
  venue: ACTIVE.venue,
  market: ACTIVE.market,
  sponsor: ACTIVE.sponsor,
  product: ACTIVE.product,
  quizSeries: "O'Learys Sunday Quiz League",
  eventStyle: "Pub quiz night",
  eventDate: "Sunday 18th September",
  eventNumber: "3rd this month",
  tournamentStage: "Qualifier",
  winnerAdvancesTo: "Semi-final",
  nextEventDate: "Sunday 25th September",
  language: ACTIVE.language,
  accent: ACTIVE.accent,
  voicePersona: "Warm, confident British pub-quiz host — friendly, a little playful, never shouty.",
  sponsorTone: "Present but not too salesy.",
  responsibleWording: "Required for alcohol-sponsor references (e.g. 'please drink responsibly, 18+').",
};

/** Sponsor/product script rules — keep references natural and responsible; never invent product facts. */
export const SPONSOR_SCRIPT_RULES = [
  "Use the sponsor/product naturally — don't sound like an advert every time.",
  "Always keep responsible wording for alcohol references (drink responsibly, 18+).",
  "Never invent product facts (ABV, origin, ingredients, awards, brewing history).",
  "Sponsor-question scripts may say 'tonight's featured sponsor/product' generically.",
  "Market-specific sponsor terms must match the active context (UK → Fuller's / London Pride).",
];
/** Safe example sponsor wordings (no factual claims). */
export const SPONSOR_SAFE_EXAMPLES = [
  "Tonight's quiz is brought to you with Fuller's and London Pride.",
  "A quick nod to tonight's featured pour before we continue.",
  "Enjoy responsibly, and keep your answers sharper than your arguments.",
];
/** How-to-play / rules note — what's actually built vs product direction. */
export const HOWTO_RULES_NOTE =
  "Multiple-choice is the live question format (seeded questions carry options). Typed-answer is product direction — phrase it as 'where enabled'. Don't overpromise features not built.";

const VOICE = "British pub host — warm, confident, playful, never shouty";
const TONE = "Premium-but-approachable; smiling; not a game-show announcer.";
const DELIVERY = "Unhurried, clear; leave a breath before answers; consistent loudness for a noisy room.";

/** Fill sponsor/product/venue placeholders for production scripts. {number} is left for the host to say live. */
const fillContext = (text: string): string =>
  text.replace(/\{sponsor\}/g, ACTIVE.sponsor).replace(/\{product\}/g, ACTIVE.product).replace(/\{venue\}/g, ACTIVE.venue);

const base = (): Omit<ProductionRow, "cueId" | "filename" | "noFile" | "family" | "phase" | "scriptText" | "priority" | "recordingStatus" | "usedBy" | "playbackType"> => ({
  voiceStyle: VOICE, toneNotes: TONE, deliveryNotes: DELIVERY,
  market: ACTIVE.market, venue: ACTIVE.venue, sponsor: ACTIVE.sponsor, product: ACTIVE.product,
  language: ACTIVE.language, accent: ACTIVE.accent, scope: "reusable", notes: "",
});

/** Build the full production pack (deterministic; derived from the playlist + script source so it can't drift). */
export function buildProductionPack(): ProductionRow[] {
  const rows: ProductionRow[] = [];
  const review = buildAnswerReviewScript();
  const add = (r: Partial<ProductionRow> & Pick<ProductionRow, "cueId" | "family" | "phase" | "scriptText" | "priority" | "recordingStatus" | "usedBy" | "playbackType">) =>
    rows.push({ ...base(), filename: null, noFile: false, ...r } as ProductionRow);

  // ── Core event cues (global) ──
  add({ cueId: "intro-welcome", filename: "intro-welcome.mp3", family: "global", phase: "intro", playbackType: "standalone", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "playlist step · host cue",
    scriptText: fillContext("Good evening and welcome to O'Learys for tonight's quiz, brought to you by Fuller's. Scan the QR code on your table, give your team a name, and answer on your phone — one shared answer per team. Please drink responsibly. Phones ready — let's play!"),
    notes: "Build energy to 'let's play!'. Keeps the responsible-sponsor line. No factual product claims." });
  // Three how-to-play variants — one per product setup mode (src/demo/setup.ts: tv_audio / audio_only / local_host).
  add({ cueId: "how-to-play", filename: "how-to-play.mp3", family: "global", phase: "how-to-play", playbackType: "standalone", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "playlist step", setupMode: "tv_audio",
    scriptText: "Scan the QR code on the main screen, any TV showing the quiz join code, or the QR on your table — or a nearby table. One person from each team joins on their phone, enters your team name, and submits the team's answers. Just follow the prompts on your phone — some questions are multiple choice, others ask for a typed answer where enabled. I'll take you through all the questions first, we'll review the answers later, and announce the winner by team number. No shouting out!",
    notes: "Setup mode: TV + audio — QR shown on the TV / main screen (and table). One device per team. Multiple choice is the live format; typed answer is product direction ('where enabled')." });
  add({ cueId: "how-to-play-audio", filename: "how-to-play-audio.mp3", family: "global", phase: "how-to-play", playbackType: "standalone", priority: "P2 useful variant", recordingStatus: "ready-to-record", usedBy: "playlist step", setupMode: "audio_only",
    scriptText: "We're playing without a screen tonight, so listen up. On your phone, head to the join page, and I'll read out tonight's join code — it's one, one, five, six, seven, eight. One person from each team enters the code, picks your team name, and answers on the phone. I'll read every question aloud first, we'll go through the answers later, and the winner's announced by team number.",
    notes: "Setup mode: Audio-only — no TV; host reads the questions aloud and gives the join code verbally (digits). One device per team." });
  add({ cueId: "how-to-play-local", filename: "how-to-play-local.mp3", family: "global", phase: "how-to-play", playbackType: "standalone", priority: "P2 useful variant", recordingStatus: "ready-to-record", usedBy: "playlist step", setupMode: "local_host",
    scriptText: "Nice and simple tonight — phones only. Scan the QR code on your table card, or I'll read out a join code for you to type in. One person from each team joins, enters your team name, and answers on the phone. I'll read the questions over the mic, we'll review the answers afterwards, and announce the winner by team number.",
    notes: "Setup mode: Local host · mic/speaker · phones-only — lowest-friction; QR on a table card or a host-read join code. One device per team." });
  add({ cueId: "sponsor-message", filename: "sponsor-message.mp3", family: "global", phase: "how-to-play", playbackType: "standalone", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "playlist step · host cue",
    scriptText: fillContext("A quick word from tonight's featured sponsor, Fuller's — enjoy a London Pride responsibly. Right, back to the quiz."),
    notes: "Natural sponsor mention, not an advert. Responsible wording. No factual product claims." });
  add({ cueId: "pause-handin", filename: "pause-handin.mp3", family: "global", phase: "answer-review-phase", playbackType: "standalone", priority: "P2 useful variant", recordingStatus: "ready-to-record", usedBy: "playlist step",
    scriptText: "Pens down for a moment — pass your answers in, grab a drink, and we'll go through the answers shortly.",
    notes: "Pause / answer hand-in — bridges the question phase and the answer-review phase." });
  add({ cueId: "answer-review-intro", filename: "answer-review-intro.mp3", family: "global", phase: "answer-review-phase", playbackType: "standalone", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "answer review assembly",
    scriptText: review.intro, notes: "Opens the answer-review phase (after all questions are read)." });
  add({ cueId: "winner-team-number", filename: "winner-team-number.mp3", family: "winner", phase: "winner", playbackType: "standalone", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "playlist step · host cue",
    scriptText: fillContext(WINNER_TEMPLATE), notes: "Use 'Team {number}', NOT a team name. Record the demo take with a chosen number (e.g. 'Team seven')." });
  add({ cueId: "outro-closing", filename: "outro-closing.mp3", family: "outro", phase: "outro", playbackType: "standalone", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "playlist step",
    scriptText: fillContext("Thanks for playing, everyone — and thanks to tonight's sponsor, Fuller's. Drink responsibly, get home safe, and we'll see you next time at O'Learys for the O'Learys Sunday Quiz League."),
    notes: "Thanks + sponsor nod + responsible tone + next-series wording. No unverified claims." });

  // ── Selected 5-question readouts (question text only — NO answer) ──
  for (const q of DEMO_PLAYLIST) {
    add({ cueId: `q${String(q.order).padStart(2, "0")}-readout`, filename: q.readoutFile, family: "question-readout", phase: "question-phase",
      playbackType: "question-content", priority: "P1 core demo", recordingStatus: "ready-to-record", usedBy: "playlist step",
      scriptText: fillContext(q.prompt), notes: `Category: ${q.categoryLabel}. Question text only — never include the answer.` });
  }

  // ── Question lead-ins (reusable; played before a readout) ──
  const qLeadins: { id: string; text: string; p: Priority }[] = [
    { id: "q-leadin-01", text: "Here's your next question.", p: "P1 core demo" },
    { id: "q-leadin-02", text: "Eyes down — next one.", p: "P1 core demo" },
    { id: "q-leadin-sport", text: "For all you sport fans, here's the next one.", p: "P2 useful variant" },
    { id: "q-leadin-music", text: "Music lovers, this one's for you.", p: "P2 useful variant" },
  ];
  for (const l of qLeadins) add({ cueId: l.id, filename: `${l.id}.mp3`, family: "question-leadin", phase: "question-phase",
    playbackType: "lead-in", priority: l.p, recordingStatus: "ready-to-record", usedBy: "reusable variant", scriptText: l.text });

  // ── Answer lead-ins (standalone — do NOT bake in the answer; the answer is a separate file) ──
  const aLeadins: { id: string; text: string; p: Priority }[] = [
    { id: "a-leadin-01", text: "Question number one.", p: "P1 core demo" },
    { id: "a-leadin-02", text: "For question two.", p: "P1 core demo" },
    { id: "a-leadin-03", text: "This one caught a few people out.", p: "P1 core demo" },
    { id: "a-leadin-sport", text: "For the football question.", p: "P2 useful variant" },
    { id: "a-leadin-sponsor", text: "And for tonight's sponsor question.", p: "P2 useful variant" },
    { id: "a-leadin-05", text: "And here comes number five.", p: "P2 useful variant" },
  ];
  for (const l of aLeadins) add({ cueId: l.id, filename: `${l.id}.mp3`, family: "answer-leadin", phase: "answer-review-phase",
    playbackType: "lead-in", priority: l.p, recordingStatus: "ready-to-record", usedBy: "answer review assembly", scriptText: l.text });
  // No-lead-in option — metadata only, NOT an MP3.
  add({ cueId: "a-leadin-none", filename: null, noFile: true, family: "answer-leadin", phase: "answer-review-phase",
    playbackType: "lead-in", priority: "P1 core demo", recordingStatus: "placeholder", usedBy: "answer review assembly",
    scriptText: "(no lead-in — play the answer file only)", notes: "Metadata only — do NOT record an MP3 for this." });

  // ── Selected 5 answer content files (short, clean — usually just the answer phrase) ──
  for (const q of DEMO_PLAYLIST) {
    add({ cueId: `a${String(q.order).padStart(2, "0")}-answer`, filename: `playlist-demo-a${String(q.order).padStart(2, "0")}-answer.mp3`,
      family: "answer-content", phase: "answer-review-phase", playbackType: "answer-content", priority: "P1 core demo", recordingStatus: "ready-to-record",
      usedBy: "answer review assembly", scriptText: `${q.answer}.`, notes: "Short, clean answer phrase only." });
  }

  // ── Answer-review assembly (metadata only — how each answer is built from lead-in + answer content) ──
  for (const q of DEMO_PLAYLIST) {
    const n = String(q.order).padStart(2, "0");
    const leadin = q.sponsor ? "a-leadin-sponsor.mp3" : `a-leadin-0${Math.min(q.order, 5)}.mp3`;
    add({ cueId: `a${n}-assembly`, filename: null, noFile: true, family: "answer-review-assembly", phase: "answer-review-phase",
      playbackType: "assembly-only", priority: "P1 core demo", recordingStatus: "placeholder", usedBy: "answer review assembly",
      scriptText: `[${leadin}] then [playlist-demo-a${n}-answer.mp3]  →  "${q.answer}."`,
      notes: "Two-part: lead-in then answer content. Use a-leadin-none to play the answer only. Never split smaller." });
  }

  // ── Optional variant takes (from scriptVariants.ts) — record later for extra variety ──
  const bankFamily: Record<string, CueFamily> = { intro: "global", repeat: "question-leadin", transition: "transition" };
  const bankPhase: Record<string, CuePhase> = { intro: "intro", repeat: "question-phase", transition: "question-phase" };
  for (const bank of VARIANT_BANKS) {
    const fam = bankFamily[bank.id];
    if (!fam) continue; // skip the reveal bank (woven into the combined review preview, not a separate file)
    for (const v of bank.variants) {
      if (!v.file) continue;
      add({ cueId: v.file.replace(/\.mp3$/, ""), filename: v.file, family: fam, phase: bankPhase[bank.id],
        playbackType: bank.id === "intro" ? "standalone" : "lead-in", priority: "P3 record later", recordingStatus: "ready-to-record",
        usedBy: "reusable variant · config preview", scriptText: fillContext(v.text), notes: `Variant take (${bank.label}${v.colour !== "generic" ? ` · ${v.colour} colour` : ""}).` });
    }
  }

  // Derive scope: a row is market-specific if it names the active sponsor/product/venue; otherwise reusable.
  const marketTerms = [ACTIVE.sponsor, ACTIVE.product, ACTIVE.venue];
  for (const r of rows) r.scope = marketTerms.some((t) => r.scriptText.includes(t)) ? "market-specific" : "reusable";

  return rows;
}

/** Recordable filenames (excludes metadata-only rows). */
export const productionFilenames = (rows: ProductionRow[] = buildProductionPack()): string[] =>
  rows.filter((r) => !r.noFile && r.filename).map((r) => r.filename as string);
