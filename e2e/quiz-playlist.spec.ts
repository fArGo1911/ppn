import { test, expect, type Page } from "@playwright/test";

/**
 * Slice 3G-C — POC quiz-evening run-order: a small 5-question demo playlist (read all first, reveal later in the
 * answer-review phase), host run-mode concept, script-style variants and an imaginary tournament/event context.
 * Planning/script model only — does NOT drive the live game loop. Deterministic; operator pre-unlocked.
 */
async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── Part B/C/E: 5-question playlist + run order; question phase vs a SEPARATE combined answer-review ──
test("/config#brand-media shows a 5-question demo playlist with a question phase and a separate answer-review phase", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Tonight's demo playlist & run order", { exact: true })).toBeVisible();
  const runTable = page.locator("table").first();
  // Question phase: Q1..Q5 readout steps.
  for (const q of ["Q1 readout", "Q5 readout"]) await expect(runTable.getByText(q, { exact: true })).toBeVisible();
  // Answer-review phase: a SINGLE combined reveal step (not one-per-question).
  await expect(runTable.getByText("Answer review (Q1–Q5)", { exact: true })).toBeVisible();
  await expect(runTable.getByText("Winner", { exact: true })).toBeVisible();
  // Both phases are named and distinct.
  await expect(runTable.getByText("Question phase", { exact: true }).first()).toBeVisible();
  await expect(runTable.getByText("Answer-review phase", { exact: true }).first()).toBeVisible();
  // Reveal is explicitly NOT immediately after each question.
  await expect(page.getByText(/never straight after each question/i).first()).toBeVisible();
});

// ── Part B: main view stays small — exactly the 5 selected questions, not a 100-question wall ──
test("/config#brand-media main playlist view shows only the 5 selected questions (no 100-question wall)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  // Each selected-question card states the review-phase answer; there should be exactly five.
  await expect(page.getByText(/Answer \(review phase\):/i)).toHaveCount(5);
  // The run-order table is bounded (intro + how-to + 5 Q + pause + combined review + winner + outro = 11 rows).
  await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(11);
});

// ── Part A/D: selected questions carry question + answer + NON-COLLIDING namespaced readout audio key ──
test("/config#brand-media selected questions show question, answer and a namespaced (non-colliding) readout key", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/How many continents are there\?/i).first()).toBeVisible(); // Q1 prompt (authoritative bank)
  // Playlist-namespaced key — NOT the live game's question-01.mp3.
  await expect(page.getByText(/readout: playlist-demo-q01-readout\.mp3/i)).toBeVisible();
  await expect(page.getByText(/No filename collision/i)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("readout: question-01.mp3");
});

// ── Part A/B: bank authority + compiler summary + category counts ──
test("/config#brand-media exposes the authoritative bank, compiler summary and category counts", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Source: authoritative bank \(\d+ Q\)/i)).toBeVisible();
  await expect(page.getByText(/Compiler mix:/i)).toBeVisible();
  await expect(page.getByText(/Selection: deterministic \(stable\)/i)).toBeVisible();
  // Category counts available in the collapsed bank browser.
  await expect(page.getByText(/Browse the question bank \(\d+ questions · \d+ categories\)/i)).toBeVisible();
});

// ── Whole-bank scripts: every question (not just the demo 5) has a recordable readout + answer script ──
test("/config#brand-media bank browser exposes a readout + answer script for every question", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  const browser = page.locator("details").filter({ hasText: "Browse the question bank" });
  await browser.locator("summary").click(); // expand the <details>
  await expect(browser).toContainText("every bank question carries a recordable readout + answer script");
  await expect(browser).toContainText("QUESTION_BANK_SCRIPT_MATRIX.md");
  // A non-demo question (e.g. geography) shows both a readout and an answer script.
  await browser.getByRole("button", { name: /Geography \/ culture · \d+/i }).click();
  await expect(browser).toContainText("Readout: “Geography / culture:");
  await expect(browser).toContainText("Answer: “The answer is");
});

// ── Part E: combined answer-review model — answers in Q1–Q5 order, one combined script/file ──
test("/config#brand-media has a combined answer-review model in playlist order", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Answer-review model", { exact: true })).toBeVisible();
  await expect(page.getByText(/playlist-demo-answer-review\.mp3/i).first()).toBeVisible();
  // The generated review script block lists the answers in playlist order (Seven, Eleven, Queen…).
  const reviewBlock = page.locator("div").filter({ hasText: "Combined answer-review script" }).last();
  await expect(reviewBlock).toContainText("Seven");
  await expect(reviewBlock).toContainText("Eleven");
  await expect(reviewBlock).toContainText("Queen");
  // Lead-ins are VARIED (not the same phrasing each time) so the single combined file doesn't sound robotic.
  await expect(reviewBlock).toContainText("For question 1, the answer was Seven.");
  await expect(reviewBlock).toContainText("Number 3, that one was Queen.");
});

// ── Part F: ElevenLabs production list for the 5-question demo ──
test("/config#brand-media has an ElevenLabs production list with Q1–Q5 readouts + combined review + team-number winner", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("ElevenLabs production list (demo)", { exact: true })).toBeVisible();
  const prod = page.locator("table").filter({ hasText: "ready to record" }).first();
  for (const cue of ["q01-readout", "q05-readout", "answer-review", "winner"]) {
    await expect(prod.getByText(cue, { exact: true })).toBeVisible();
  }
  await expect(prod.getByText("winner.mp3", { exact: true })).toBeVisible();
  await expect(prod.getByText(/ready to record/i).first()).toBeVisible();
});

// ── Part D: host run mode — manual/semi/auto with honest live status ──
test("/config#brand-media offers manual/semi-automatic/automatic host run modes with honest status", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Host run mode", { exact: true })).toBeVisible();
  for (const m of ["Manual", "Semi-automatic", "Automatic"]) await expect(page.getByText(m, { exact: true }).first()).toBeVisible();
  await expect(page.getByText("live now", { exact: true })).toBeVisible();
  await expect(page.getByText("concept only", { exact: true })).toBeVisible();
  await expect(page.getByText("not wired", { exact: true }).first()).toBeVisible();
});

// ── Part E/F: script style variants + event/tournament context ──
test("/config#brand-media exposes script style variants and a tournament/event context", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  // Style variants.
  await expect(page.getByText("Script style variant", { exact: true })).toBeVisible();
  for (const s of ["Warm pub host", "Sport-heavy", "Dry humour"]) await expect(page.getByRole("button", { name: s }).first()).toBeVisible();
  // Event / tournament context fields.
  await expect(page.getByText("Event & tournament context", { exact: true })).toBeVisible();
  for (const v of ["Oliver's Sunday Quiz League", "Qualifier", "Semi-final", "Sunday 18th September"]) {
    await expect(page.getByText(v, { exact: true }).first()).toBeVisible();
  }
});

// ── Part I/E: winner uses team number; varied repeat phrasing guidance present ──
test("/config#brand-media keeps Team-number winner guidance and varied repeat phrasing", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Team \{number\}/i).first()).toBeVisible();
  await expect(page.getByText(/The table by the bar might need this one again/i)).toBeVisible();
  // No generation wording anywhere.
  await expect(page.getByText(/no AI voice, no generation/i)).toBeVisible();
});
