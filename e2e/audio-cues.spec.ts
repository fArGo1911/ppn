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
