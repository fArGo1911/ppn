import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { buildProductionPack, productionFilenames } from "../src/demo/elevenLabsProduction";
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
