import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { buildProductionPack, productionFilenames, PRODUCTION_CONTEXT, MARKET_CONTEXTS } from "../src/demo/elevenLabsProduction";
import { DEMO_PLAYLIST } from "../src/demo/quizPlaylist";

/**
 * Slice 3G-F — ElevenLabs production-pack export integrity. Pure source/metadata test (no page, no audio,
 * no API). Verifies the committed docs match the source of truth and the recording model is sound.
 */
const MD = "docs/demo-assets/ELEVENLABS_PRODUCTION_TABLE.md";
const JSON_PACK = "docs/demo-assets/elevenlabs-production-pack.json";

test("production docs (MD + JSON) exist and the JSON matches the source of truth", () => {
  const md = readFileSync(MD, "utf8");
  expect(md).toContain("ElevenLabs production pack");
  const json = JSON.parse(readFileSync(JSON_PACK, "utf8"));
  // Metadata-only honesty (no generation / no API / no key).
  expect(json.note.toLowerCase()).toContain("does not generate audio");
  // No drift: committed JSON row count equals the live source.
  expect(json.totalRows).toBe(buildProductionPack().length);
});

test("every production row has the required metadata and a file (or explicit noFile)", () => {
  for (const r of buildProductionPack()) {
    expect(r.cueId, `cueId on ${JSON.stringify(r)}`).toBeTruthy();
    expect(r.family).toBeTruthy();
    expect(r.phase).toBeTruthy();
    expect(r.priority).toBeTruthy();
    expect(r.scriptText, `scriptText on ${r.cueId}`).toBeTruthy();
    // filename present, OR explicitly metadata-only.
    expect(Boolean(r.filename) || r.noFile === true, `file/noFile on ${r.cueId}`).toBe(true);
  }
});

test("recordable filenames are unique and never use the ambiguous live-game namespace", () => {
  const files = productionFilenames();
  expect(new Set(files).size).toBe(files.length); // unique
  for (const f of files) expect(f).not.toMatch(/^question-\d+\.mp3$|^reveal-\d+\.mp3$/);
  // The selected playlist uses the namespaced playlist-demo-* keys.
  expect(files).toContain("playlist-demo-q01-readout.mp3");
  expect(files).toContain("playlist-demo-a01-answer.mp3");
});

test("P1 core demo includes intro, how-to, Q1–Q5 readouts, answer-review intro, A1–A5 answers, winner, outro", () => {
  const rows = buildProductionPack();
  const p1 = new Set(rows.filter((r) => r.priority === "P1 core demo").map((r) => r.cueId));
  for (const id of ["intro-welcome", "how-to-play", "answer-review-intro", "winner-team-number", "outro-closing"]) {
    expect(p1.has(id), `P1 missing ${id}`).toBe(true);
  }
  for (let n = 1; n <= 5; n++) {
    expect(p1.has(`q0${n}-readout`), `P1 missing q0${n}-readout`).toBe(true);
    expect(p1.has(`a0${n}-answer`), `P1 missing a0${n}-answer`).toBe(true);
  }
});

test("answer lead-ins have multiple variants + a no-lead-in metadata option; answers are separate files", () => {
  const rows = buildProductionPack();
  const leadins = rows.filter((r) => r.family === "answer-leadin");
  expect(leadins.filter((r) => r.filename).length).toBeGreaterThanOrEqual(3); // multiple recordable lead-ins
  const none = leadins.find((r) => r.cueId === "a-leadin-none");
  expect(none?.noFile).toBe(true); // no-lead-in is metadata only
  expect(none?.filename).toBeNull();
  // Answer CONTENT and answer LEAD-IN are different families (two-part assembly, not merged).
  const content = rows.filter((r) => r.family === "answer-content");
  expect(content.length).toBe(5);
  expect(content.every((r) => leadins.every((l) => l.cueId !== r.cueId))).toBe(true);
});

test("question readouts and question lead-ins are separate; readouts carry the playlist question text, no answer", () => {
  const rows = buildProductionPack();
  const readouts = rows.filter((r) => r.family === "question-readout");
  const qLeadins = rows.filter((r) => r.family === "question-leadin");
  expect(readouts.length).toBe(5);
  expect(qLeadins.length).toBeGreaterThanOrEqual(2);
  // Readout text matches the selected playlist and never contains the answer.
  for (const q of DEMO_PLAYLIST) {
    const r = readouts.find((x) => x.cueId === `q0${q.order}-readout`);
    expect(r, `readout for Q${q.order}`).toBeTruthy();
    expect(r!.scriptText).not.toContain(q.answer); // no answer leaked into the readout
  }
});

test("winner cue uses Team {number}, not a team name", () => {
  const winner = buildProductionPack().find((r) => r.cueId === "winner-team-number");
  expect(winner?.scriptText).toContain("Team {number}");
});

// ── 3G-G: context alignment ──
test("active context is O'Learys / UK / Fuller's / London Pride; other markets are reference/future", () => {
  expect(PRODUCTION_CONTEXT.venue).toBe("O'Learys");
  expect(PRODUCTION_CONTEXT.market).toBe("UK");
  expect(PRODUCTION_CONTEXT.sponsor).toBe("Fuller's");
  expect(PRODUCTION_CONTEXT.product).toBe("London Pride");
  const active = MARKET_CONTEXTS.filter((m) => m.active);
  expect(active).toHaveLength(1);
  expect(active[0].market).toBe("UK");
  // Sweden + Germany exist but only as reference/future.
  const se = MARKET_CONTEXTS.find((m) => m.market === "Sweden");
  const de = MARKET_CONTEXTS.find((m) => m.market === "Germany");
  expect(se?.active).toBe(false);
  expect(se?.sponsor).toBe("Spendrups");
  expect(se?.product).toBe("Norrlands Guld");
  expect(de?.active).toBe(false);
  expect(de?.sponsor).toBe("Krombacher");
  expect(de?.product).toBe("Krombacher Pils");
});

test("no misspelled venue/sponsor/product names anywhere in the pack", () => {
  const blob = JSON.stringify({ PRODUCTION_CONTEXT, MARKET_CONTEXTS, rows: buildProductionPack() });
  for (const bad of [/Spandrips/i, /Chromebasher/i, /Krombasher/i, /Solaris/i, /Spendrups Pils/i, /O'?Learys Guld/i]) {
    expect(blob).not.toMatch(bad);
  }
  // Correct names are present.
  expect(blob).toContain("O'Learys");
  expect(blob).toContain("Fuller's");
  expect(blob).toContain("London Pride");
});

test("two how-to-play / rules variants exist", () => {
  const rows = buildProductionPack();
  const v1 = rows.find((r) => r.cueId === "how-to-play");
  const v2 = rows.find((r) => r.cueId === "how-to-play-2");
  expect(v1?.scriptText).toBeTruthy();
  expect(v2?.scriptText).toBeTruthy();
  // Variant 2 references the flexible phone/MC/typed flow with honest "where enabled" phrasing.
  expect(v2?.scriptText.toLowerCase()).toContain("where enabled");
});

test("intro and outro mention the active venue + sponsor; outro keeps responsible tone", () => {
  const rows = buildProductionPack();
  const intro = rows.find((r) => r.cueId === "intro-welcome")!;
  const outro = rows.find((r) => r.cueId === "outro-closing")!;
  for (const t of [intro.scriptText, outro.scriptText]) {
    expect(t).toContain("O'Learys");
    expect(t).toContain("Fuller's");
  }
  expect(intro.scriptText.toLowerCase()).toContain("responsibl");
  expect(outro.scriptText.toLowerCase()).toContain("responsibl");
  // Intro/sponsor/winner/outro/q05 are market-specific; generic lead-ins/answers are reusable.
  const mkt = new Set(rows.filter((r) => r.scope === "market-specific").map((r) => r.cueId));
  for (const id of ["intro-welcome", "sponsor-message", "winner-team-number", "outro-closing", "q05-readout"]) expect(mkt.has(id)).toBe(true);
  expect(rows.find((r) => r.cueId === "a01-answer")?.scope).toBe("reusable");
});

test("sponsor message + pause/hand-in cues exist; no unverified factual product claims", () => {
  const rows = buildProductionPack();
  expect(rows.some((r) => r.cueId === "sponsor-message")).toBe(true);
  expect(rows.some((r) => r.cueId === "pause-handin")).toBe(true);
  // No invented brewery/product facts (ABV, origin, awards, brewing history).
  for (const r of rows) {
    for (const claim of [/\bABV\b/i, /% alcohol/i, /award[- ]winning/i, /founded in/i, /brewed since/i, /established \d{4}/i]) {
      expect(r.scriptText, `factual claim in ${r.cueId}`).not.toMatch(claim);
    }
  }
});
