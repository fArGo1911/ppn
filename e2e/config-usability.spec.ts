import { test, expect, type Page } from "@playwright/test";

/**
 * /config usability + deep-link truthfulness (Slice 3D-A). Deep links must visibly land on their section, the page
 * is task-based (Brand & media · Campaign assumptions / demo numbers · Session & run), the theme studio is honest
 * about what it affects, and no "scenario" / "AI intro" wording remains. IA/copy only; deterministic, no Supabase.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── Hash deep links land on the right section ──
test("/config#brand-media scrolls the Brand & media section into view", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.locator("#brand-media")).toBeInViewport();
});

test("/config#demo-numbers scrolls the Campaign assumptions / demo numbers section into view", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#demo-numbers");
  await expect(page.locator("#demo-numbers")).toBeInViewport();
});

test("/config#session scrolls the Session & run section into view", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#session");
  await expect(page.locator("#session")).toBeInViewport();
});

// ── /operator still points to the correct /config anchors ──
test("/operator keeps the /config deep links", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.locator('a[href="/config#brand-media"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#demo-numbers"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#session"]').first()).toBeVisible();
});

// ── Task-based structure + truthful labels ──
test("/config shows the three task sections and labels /setup as the slot guide", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config");
  await expect(page.getByRole("heading", { name: /Brand & media setup/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Campaign assumptions \/ demo numbers/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Session & run/i }).first()).toBeVisible();
  // Active preset summary first; full catalogue collapsed behind a disclosure (not the dominant first wall).
  await expect(page.getByText("Active preset · change preset", { exact: true })).toBeVisible();
  await expect(page.getByText(/show all 12 branded presets/i)).toBeVisible();
  // /setup referenced as the slot guide.
  await expect(page.locator('a[href^="/setup"]').first()).toBeVisible();
  await expect(page.getByText(/asset reference \/ slot guide/i).first()).toBeVisible();
});

// ── Terminology truthfulness ──
test("/config has no visible 'scenario' or 'AI intro' wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config");
  await expect(page.getByText(/scenario/i)).toHaveCount(0);
  await expect(page.getByText(/AI intro/i)).toHaveCount(0);
  await expect(page.getByText(/Play AI intro/i)).toHaveCount(0);
});

// ── Theme studio is honest about what it affects (does not claim it changes all live surfaces) ──
test("/config theme preview states its limits truthfully", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config");
  await expect(page.getByText("Operator theme preview", { exact: true })).toBeVisible();
  // States the real behaviour: applies on next load / reload to repaint; sample is representative, not a live mirror.
  await expect(page.getByText(/next page load/i)).toBeVisible();
  await expect(page.getByText(/representative/i).first()).toBeVisible();
  // Must NOT claim it applies to all demo surfaces instantly.
  await expect(page.getByText(/applies to all demo surfaces/i)).toHaveCount(0);
});
