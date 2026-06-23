import { test, expect, type Page } from "@playwright/test";

/**
 * Active-demo preview (/operator) + asset reference / slot guide (/setup) — Slice 3C-A. /operator gets a compact
 * read-only preview of the active demo's surfaces + deep links into the /setup reference; /setup is reworked into
 * a practical anchored slot guide (minimum pack · asset slots · where assets appear · advanced reference).
 * IA/design only; deterministic, no Supabase.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── /operator: Preview active demo + structure preserved ──
test("/operator shows a Preview active demo area linking the key surfaces, structure intact", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText("Preview active demo", { exact: true })).toBeVisible();
  for (const r of ["/tv/DEMO", "/play/DEMO", "/presentation", "/report", "/kpi"]) {
    await expect(page.locator(`a[href="${r}"]`).first()).toBeVisible();
  }
  await expect(page.getByText("Active demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Available demo presets", { exact: true })).toBeVisible();
  await expect(page.getByText(/Custom client demo/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Design demo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Preview client tour" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run live demo" })).toBeVisible();
  await expect(page.getByText(/Appendix \/ supporting material/i)).toBeVisible();
});

test("/operator deep-links into /setup anchors and keeps the /config anchors", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.locator('a[href="/setup#minimum-pack"]').first()).toBeVisible();
  await expect(page.locator('a[href="/setup#asset-slots"]').first()).toBeVisible();
  await expect(page.locator('a[href="/setup#where-assets-appear"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#brand-media"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#demo-numbers"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#session"]').first()).toBeVisible();
});

test("/operator introduces no scenario / CMS / generated-graphics / Ambient wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  for (const t of [/scenario/i, /\bCMS\b/i, /AI generation/i, /generated graphics/i, /Ambient/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});

// ── /setup: asset reference / slot guide ──
test("/setup is an asset reference / slot guide pointing config to /config#brand-media", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /Asset reference \/ slot guide/i })).toBeVisible();
  await expect(page.getByText(/slot guide only/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /brand & media setup/i }).first()).toBeVisible();
  await expect(page.locator('a[href^="/config#brand-media"]').first()).toBeVisible();
});

test("/setup has stable anchors for the four sections", async ({ page }) => {
  await page.goto("/setup");
  for (const id of ["minimum-pack", "asset-slots", "where-assets-appear", "advanced-reference"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test("/setup lists the minimum asset pack", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /Minimum asset pack/i }).first()).toBeVisible();
  await expect(page.getByText(/TV welcome \/ hero image/i)).toBeVisible();
});

test("/setup asset slots include size, aspect, placement, status and where to configure", async ({ page }) => {
  await page.goto("/setup");
  const slots = page.locator("#asset-slots");
  await expect(slots.getByText(/Size:/).first()).toBeVisible();
  await expect(slots.getByText(/Aspect:/).first()).toBeVisible();
  await expect(slots.getByText(/Appears:/).first()).toBeVisible();
  await expect(slots.getByText(/Configure:/).first()).toBeVisible();
  await expect(slots.getByText(/live in demo/i).first()).toBeVisible();
  await expect(slots.getByText(/preview-only/i).first()).toBeVisible();
});

test("/setup groups where assets appear by UX surface", async ({ page }) => {
  await page.goto("/setup");
  const w = page.locator("#where-assets-appear");
  await expect(w.getByText("TV / audience display")).toBeVisible();
  await expect(w.getByText("Player phone")).toBeVisible();
  await expect(w.getByText("Client presentation")).toBeVisible();
  await expect(w.getByText("Report / KPI")).toBeVisible();
});

test("/setup introduces no generated-graphics / AI image wording", async ({ page }) => {
  await page.goto("/setup");
  for (const t of [/generated graphics/i, /AI image/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});
