import { test, expect, type Page } from "@playwright/test";

/**
 * Slice 3F-D — every visual slot is a media-capable slot with a truthful capability classification. Video slots
 * (intro/bumper/closing) are live TV media; image slots are image/GIF (no video); /setup is a slim reference with
 * the noisy advanced wall removed. Deterministic; real upload not exercised. Operator pre-unlocked where gated.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── /config#brand-media: video slots + per-slot media capability ──
test("/config#brand-media lists video slots as live media slots with capability + fit + behaviour", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  for (const v of ["Intro video", "Sponsor bumper video", "Closing video"]) {
    await expect(page.getByText(v, { exact: true })).toBeVisible();
  }
  // Video capability + truthful video behaviour.
  await expect(page.getByText(/Media: video \(MP4\/WebM\) · host presses play · muted, no autoplay/i).first()).toBeVisible();
  // Image slots state image/GIF (no video), not pretend-video.
  await expect(page.getByText(/Media: image \/ GIF \(no video on this slot\)/i).first()).toBeVisible();
  // Not-built / not-wired list mentions the genuinely unwired media.
  await expect(page.getByText(/picture\/video question media/i)).toBeVisible();
});

// ── Branded visual slots are media-capable: hero/venue = image+video; logo/sponsor-slide = image only ──
test("/config#brand-media classifies hero/venue as image+video and image-only slots truthfully", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Media: image \/ GIF \/ video — video renders on the surface/i).first()).toBeVisible();
  await expect(page.getByText(/Media: image \/ GIF \(no video on this slot\)/i).first()).toBeVisible();
  // Video-capable slots accept video; image-only slots don't.
  const heroAccept = await page.locator('input[type="file"][accept="image/*,video/*"]').count();
  expect(heroAccept).toBeGreaterThanOrEqual(2); // hero + venue
});

// ── Script & audio cue assets — uploadable MP3 per cue; core cues live (host), others stored-only ──
test("/config#brand-media has a Script & audio cue section with core cues + live/stored status", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Script & audio cue assets/i)).toBeVisible();
  for (const cue of ["Intro / welcome", "Question readout / question cue", "Winner announcement"]) {
    await expect(page.getByText(cue, { exact: true })).toBeVisible();
  }
  // Per-cue MP3 upload control + accepted types + a live/stored classification.
  await expect(page.locator('input[type="file"][accept="audio/*"]')).not.toHaveCount(0);
  await expect(page.getByText(/Accepted: MP3/i)).toBeVisible();
  await expect(page.getByText("live (host)", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("stored-only", { exact: true }).first()).toBeVisible();
  // No AI/generation claim.
  await expect(page.getByText(/no AI voice, no generation/i)).toBeVisible();
});

// ── /setup: slim reference, video live, statuses distinguished ──
test("/setup is a slim reference (Technical appendix only) with live video slots", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /Technical appendix/i }).first()).toBeVisible();
  // The long "Advanced reference" wall is gone.
  await expect(page.getByText(/Advanced reference/i)).toHaveCount(0);
  // Only a couple of collapsed details remain (zone map + host scripts), not ~10.
  const detailsCount = await page.locator("#advanced-reference details").count();
  expect(detailsCount).toBeLessThanOrEqual(3);
  // Live video slots labelled, and the not-wired one is honest.
  await expect(page.getByText(/Video slots — live on TV/i)).toBeVisible();
  await expect(page.getByText("TV intro video", { exact: true })).toBeVisible();
  await expect(page.getByText(/live \(TV\)/i).first()).toBeVisible();
  await expect(page.getByText("not built", { exact: true }).first()).toBeVisible();
  // Image slot media classification + the video-capable hero/venue classification, + configure/upload link.
  await expect(page.getByText(/Media:.*image \/ GIF/i).first()).toBeVisible();
  await expect(page.getByText(/Media:.*image \/ GIF \/ video \(renders on the surface\)/i).first()).toBeVisible();
  await expect(page.locator('a[href="/config#brand-media"]').first()).toBeVisible();
});

// ── /setup keeps the essentials (reference-only, not an upload page) ──
test("/setup keeps minimum pack + asset slots + where-assets and stays reference-only", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /Minimum asset pack/i }).first()).toBeVisible();
  await expect(page.locator("#asset-slots")).toBeVisible();
  await expect(page.locator("#where-assets-appear")).toBeVisible();
  await expect(page.getByText(/slot guide only/i)).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0); // no upload controls on /setup
});
