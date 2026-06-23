import { test, expect, type Page } from "@playwright/test";

/**
 * Slice 3G-C — POC quiz-evening run-order: a small 5-question demo playlist (read all first, reveal later in the
 * answer-review phase), host run-mode concept, script-style variants and an imaginary tournament/event context.
 * Planning/script model only — does NOT drive the live game loop. Deterministic; operator pre-unlocked.
 */
async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── Part B/C: 5-question playlist + run order; question vs answer-review phase distinct ──
test("/config#brand-media shows a 5-question demo playlist with a question phase and a separate answer-review phase", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Tonight's demo playlist & run order", { exact: true })).toBeVisible();
  const runTable = page.locator("table").first();
  // Question phase: Q1..Q5 readout steps.
  for (const q of ["Q1 readout", "Q5 readout"]) await expect(runTable.getByText(q, { exact: true })).toBeVisible();
  // Answer-review phase: A1..A5 reveal steps (separate from the question phase).
  for (const a of ["A1 reveal", "A5 reveal"]) await expect(runTable.getByText(a, { exact: true })).toBeVisible();
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
  // The run-order table is bounded (intro + how-to + 5 Q + pause + 5 A + winner + outro = 15 rows).
  await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(15);
});

// ── Part A: selected questions carry question + answer + separate readout/review audio metadata ──
test("/config#brand-media selected questions show question, answer and separate readout/review audio", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/How many continents are there\?/i).first()).toBeVisible(); // Q1 prompt (seeded bank)
  await expect(page.getByText(/readout: question-01\.mp3/i)).toBeVisible();
  await expect(page.getByText(/review: reveal-01\.mp3/i)).toBeVisible();
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
