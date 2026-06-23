import { test, expect } from "@playwright/test";

/**
 * Generated-looking SVG picture cleanup (Slice 3D-B). The decorative in-repo Northgate SVG illustrations (hero /
 * sponsor-slide / venue / phone-card / lower-third / logo) are removed; surfaces fall back to brand initials + a
 * neutral panel, and /setup shows plain labelled spec slots (size · aspect), not fake pictures. No generated
 * artwork is added. Deterministic, no Supabase.
 */

const NORTHGATE_SVG = 'img[src*="/demo/assets/northgate"]';

// ── No decorative Northgate SVG picture assets render on any visible surface ──
for (const route of ["/setup", "/play/DEMO", "/presentation", "/", "/config"]) {
  test(`no decorative Northgate SVG image on ${route}`, async ({ page }) => {
    if (route === "/config") await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
    await page.goto(route);
    await expect(page.locator(NORTHGATE_SVG)).toHaveCount(0);
  });
}

// ── /setup shows honest compact spec cards (size + aspect + placement + status + configure), no fake pictures ──
test("/setup asset slots are compact spec cards with no picture content", async ({ page }) => {
  await page.goto("/setup#asset-slots");
  const slots = page.locator("#asset-slots");
  await expect(slots.locator("img")).toHaveCount(0); // no picture/image content in the slot cards
  await expect(slots.getByText(/Size:/).first()).toBeVisible();
  await expect(slots.getByText(/Aspect:/).first()).toBeVisible();
  await expect(slots.getByText(/Appears:/).first()).toBeVisible();
  await expect(slots.getByRole("link", { name: /Configure in detailed config/i }).first()).toBeVisible();
  await expect(slots.getByText(/live in demo/i).first()).toBeVisible();
  await expect(slots.getByText(/preview-only/i).first()).toBeVisible();
});

// ── No generated-graphics / AI-image wording introduced ──
test("/setup introduces no generated-graphics / AI image wording", async ({ page }) => {
  await page.goto("/setup");
  for (const t of [/generated graphics/i, /AI image/i, /AI-generated illustration/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});
