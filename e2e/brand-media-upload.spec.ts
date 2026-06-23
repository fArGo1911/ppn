import { test, expect, type Page } from "@playwright/test";

/**
 * /config#brand-media slot-based asset manager + preview (Slice 3E-A). Each brand/media slot has its own
 * upload / manual-path / clear (reusing the existing storage primitives), grouped required/recommended/optional,
 * with an asset-readiness summary and a read-only "Preview active demo". Deterministic; real file upload is NOT
 * exercised (storage may be offline) — we assert the per-slot UI contract. Operator pre-unlocked.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

test("/config#brand-media shows a Current demo assets summary in plain language (no pack-first)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Current demo assets", { exact: true })).toBeVisible();
  await expect(page.getByText(/\d\/5 required ready/)).toBeVisible();
  await expect(page.getByText(/grouped into this demo's client asset set automatically/i)).toBeVisible();
  // The pack is no longer a Step-1 mental model.
  await expect(page.getByText(/Step 1 · asset pack/i)).toHaveCount(0);
});

test("/config#brand-media is a slot manager: required/recommended/optional groups + per-slot upload", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Upload by slot", { exact: true })).toBeVisible();
  // Group headings.
  for (const g of ["Required", "Recommended", "Optional"]) {
    await expect(page.getByText(g, { exact: true }).first()).toBeVisible();
  }
  // Individually addressable key slots.
  for (const slot of ["Brewery / client logo", "TV hero / campaign background", "TV sponsor slide / offer card", "Phone sponsor card", "Venue / background image"]) {
    await expect(page.getByText(slot, { exact: true })).toBeVisible();
  }
  // Each slot has its own upload control + manual path — not one generic box.
  await expect(page.locator('input[type="file"]')).not.toHaveCount(0);
  expect(await page.locator('input[type="file"]').count()).toBeGreaterThanOrEqual(5);
  // Manual path exists but is demoted (inside the collapsed "Advanced fallback" details), not the primary path.
  expect(await page.getByPlaceholder("paste path / URL").count()).toBeGreaterThanOrEqual(5);
  // Per-slot spec (size/aspect/placement) + status + per-card configure-spec link.
  await expect(page.getByText(/1920×1080/).first()).toBeVisible();
  await expect(page.getByText(/Appears:/).first()).toBeVisible();
  await expect(page.getByText(/missing|preset|manual path|uploaded/i).first()).toBeVisible();
  await expect(page.locator('a[href="/setup#asset-slots"]').first()).toBeVisible();
});

test("/config#brand-media is a CMS-lite media asset manager with dynamic/static/not-built + liveness", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByRole("heading", { name: /Media asset manager/i })).toBeVisible();
  await expect(page.getByText(/Dynamic:/).first()).toBeVisible();
  await expect(page.getByText(/Static:/).first()).toBeVisible();
  await expect(page.getByText(/Not built/).first()).toBeVisible();
  // Per-slot liveness badge, a primary upload/replace action, and a demoted advanced-fallback manual field.
  await expect(page.getByText("live", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("preview-only", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/⬆ (Upload|Replace) file/).first()).toBeVisible();
  await expect(page.getByText(/Advanced fallback: manual path \/ URL/i).first()).toBeVisible();
});

test("/config#brand-media has one clear Apply (no Step-1 pack heading, no duplicate apply)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Apply changes", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply uploaded assets to demo" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Reset to preset defaults/i }).first()).toBeVisible();
  // The confusing duplicate apply + step-1 pack mental model are gone.
  await expect(page.getByRole("button", { name: "Apply uploaded pack" })).toHaveCount(0);
  await expect(page.getByText(/Step 1 · asset pack/i)).toHaveCount(0);
});

test("/config#brand-media has a Preview active demo linking the real surfaces", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Preview active demo", { exact: true })).toBeVisible();
  for (const r of ["/tv/DEMO", "/play/DEMO", "/presentation", "/report", "/kpi"]) {
    await expect(page.locator(`a[href="${r}"]`).first()).toBeVisible();
  }
});

test("/config#brand-media introduces no scenario / Play-AI-intro / CMS / generated-graphics / Ambient / Phase10B wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  for (const t of [/scenario/i, /Play AI intro/i, /generated graphics/i, /AI-generated asset/i, /Ambient/i, /Phase 10B/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
  // "CMS" only appears as the allowed "CMS-lite media asset manager" label — never a full-CMS claim.
  await expect(page.getByText(/CMS-lite media asset manager/i)).toBeVisible();
  await expect(page.getByText(/full CMS/i)).toHaveCount(0);
});
