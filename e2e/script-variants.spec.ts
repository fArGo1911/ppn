import { test, expect, type Page } from "@playwright/test";

/**
 * Slice 3G-E — generic script variant banks. High-frequency cues (intro openers, repeat/read-again,
 * answer-review lead-ins, transitions) each get 6–8 varied lines to RECORD as separate MP3s so the audio
 * never sounds templated. Script bank only — no runtime rotation, no generation. Operator pre-unlocked.
 */
async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

test("/config#brand-media shows generic script variant banks for the high-frequency cues", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Generic script variant banks", { exact: true })).toBeVisible();
  for (const bank of ["Intro openers", "Repeat / read-again", "Answer-review lead-ins", "Transitions / banter"]) {
    await expect(page.getByText(bank, { exact: true }).first()).toBeVisible();
  }
});

test("/config#brand-media repeat-the-question bank has at least 6 varied lines incl. venue + category colour", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  // The repeat bank advertises its size and includes namespaced, non-colliding filenames.
  await expect(page.getByText("8 variants", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/generic-repeat-01\.mp3/i)).toBeVisible();
  await expect(page.getByText(/generic-repeat-08\.mp3/i)).toBeVisible();
  // Variety beyond plain generic: a venue-colour line and a sport-colour line.
  await expect(page.getByText(/The table by the bar might want this one again/i)).toBeVisible();
  await expect(page.getByText(/For all you football fans out there/i).first()).toBeVisible();
});

test("/config#brand-media variant banks are a record-from script bank, not runtime generation", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/record every one as its own MP3/i)).toBeVisible();
  await expect(page.getByText(/rotation parked/i)).toBeVisible();
  await expect(page.getByText(/Record every line in a bank/i)).toBeVisible();
});
