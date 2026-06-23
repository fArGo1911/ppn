import { test, expect, type Page } from "@playwright/test";

/**
 * Slice 3G-A — wizard demoted to "Demo brief & content mix" (not the primary setup), and a live script/MP3 audio
 * cue workflow on /config#brand-media (operator-supplied MP3s; core cues host-triggered, others stored-only).
 * No AI/TTS/generation. Deterministic; real MP3 upload not exercised. Operator pre-unlocked where gated.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── Part A: wizard demotion ──
test("/operator demotes the wizard to 'Demo brief & content mix' (not the primary setup)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByRole("link", { name: /Demo brief & content mix/i }).first()).toBeVisible();
  // The Lane-1 wizard entry is no longer labelled "Demo setup wizard".
  await expect(page.getByRole("link", { name: /^Demo setup wizard/i })).toHaveCount(0);
  await expect(page.locator('a[href="/operator/setup-wizard"]').first()).toBeVisible();
});

test("/operator/setup-wizard heading is reframed and does not claim media/config/session", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator/setup-wizard");
  await expect(page.getByRole("heading", { name: /Demo brief & content mix/i })).toBeVisible();
  await expect(page.getByText(/does not handle media uploads/i)).toBeVisible();
});

// ── Part B/D: live audio cue workflow ──
test("/config#brand-media audio is no longer globally 'not built' (MP3 cues where wired)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/MP3 audio cues where wired/i)).toBeVisible();
  // A live-cue readiness summary exists.
  await expect(page.getByText(/\d\/\d live cues ready/)).toBeVisible();
});

test("/config#brand-media audio cues show script, where-used, fallback wording and a preview/upload contract", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  // Script reference is available (collapsed) and where-used + fallback are stated.
  await expect(page.getByText(/Script \(reference copy\)/i).first()).toBeVisible();
  await expect(page.getByText(/Where: Host · intro/i)).toBeVisible();
  await expect(page.getByText(/host\/TV use the uploaded cue first, falling back to the fixed/i)).toBeVisible();
});

// ── Part A/C: scalable cue taxonomy grouped into families ──
test("/config#brand-media groups audio cues into a scalable family taxonomy", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  for (const fam of ["Global event cues", "Round / category cues", "Question readout cues", "Answer-review cues", "Sponsor / special-question cues"]) {
    await expect(page.getByText(fam, { exact: true })).toBeVisible();
  }
  // Core global cues are present.
  for (const cue of ["Intro / welcome", "How to play / competition explanation", "Winner announcement"]) {
    await expect(page.getByText(cue, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/Outro \/ closing/i)).toBeVisible();
});

// ── Part B: UK flow — question phase vs answer-review phase, reveal is later not after each question ──
test("/config#brand-media states the UK question/answer-review flow (reveal later, not per question)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Question readout phase/i)).toBeVisible();
  await expect(page.getByText(/Answer review phase/i)).toBeVisible();
  await expect(page.getByText(/not after each question/i).first()).toBeVisible();
});

// ── Part C: question-level library is a table, not a flat wall of cards ──
test("/config#brand-media question audio library is a table with category selector", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Question audio library", { exact: true })).toBeVisible();
  // It is a real table with the documented columns.
  const table = page.locator("table").first();
  await expect(table.getByText("Readout audio", { exact: true })).toBeVisible();
  await expect(table.getByText("Answer-review audio", { exact: true })).toBeVisible();
  await expect(table.locator("tbody tr").first()).toBeVisible();
  // Category selector drives the table.
  const catSelect = page.getByRole("combobox").first();
  await expect(catSelect).toBeVisible();
  await expect(catSelect.locator("option", { hasText: "General knowledge" })).toHaveCount(1);
});

// ── Part E/F: script style guidance + winner uses team number, no generation wording ──
test("/config#brand-media script guidance varies phrasing and announces winners by team number", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Vary repeated phrases/i)).toBeVisible();
  await expect(page.getByText(/The table by the bar might need this one again/i)).toBeVisible();
  // Winner uses Team number, not the entered team name.
  await expect(page.getByText(/Team \{number\}/i).first()).toBeVisible();
  await expect(page.getByText(/not the entered team name/i).first()).toBeVisible();
  // No AI/voice generation anywhere in the audio manager.
  await expect(page.getByText(/no AI voice, no generation/i)).toBeVisible();
});
