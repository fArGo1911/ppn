import { test, expect, type Page } from "@playwright/test";

/**
 * /config section navigation (Slice 3D-B). Hash-controlled in-page tabs: each of /config#brand-media,
 * /config#demo-numbers, /config#session renders a DIFFERENT working section (non-active sections are not in the
 * DOM) with an active nav state — so the three URLs are visibly distinct, not just scrolled. Plus truthfulness
 * regressions. IA only; deterministic, no Supabase. Operator pre-unlocked.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// Section-unique markers (each appears in exactly one section's work area).
const BRAND = /Active preset · change preset/i;     // brand-media only
const NUMBERS = /Prepare believable demo numbers/i;  // demo-numbers only
const SESSION = "Setup mode (output)";               // session only

// ── Each hash shows a distinct active section; the others are NOT the visible work area ──
test("/config#brand-media shows only the Brand & media section + active nav state", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(BRAND)).toBeVisible();
  await expect(page.getByText(NUMBERS)).toHaveCount(0);
  await expect(page.getByText(SESSION, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Brand & media/i })).toHaveAttribute("aria-current", "page");
});

test("/config#demo-numbers shows only the Campaign assumptions / demo numbers section + active nav state", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#demo-numbers");
  await expect(page.getByText(NUMBERS)).toBeVisible();
  await expect(page.getByText(BRAND)).toHaveCount(0);
  await expect(page.getByText(SESSION, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Campaign assumptions \/ demo numbers/i })).toHaveAttribute("aria-current", "page");
});

test("/config#session shows only the Session & run section + active nav state", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#session");
  await expect(page.getByText(SESSION, { exact: true })).toBeVisible();
  await expect(page.getByText("Demo session", { exact: true })).toBeVisible();
  await expect(page.getByText("Audience mode (presentation)", { exact: true })).toBeVisible();
  await expect(page.getByText(BRAND)).toHaveCount(0);
  await expect(page.getByText(NUMBERS)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Session & run/i })).toHaveAttribute("aria-current", "page");
});

// ── Default load (no hash) → Brand & media ──
test("/config defaults to the Brand & media section", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config");
  await expect(page.getByText(BRAND)).toBeVisible();
  await expect(page.getByText(SESSION, { exact: true })).toHaveCount(0);
});

// ── Clicking the nav swaps the visible working section ──
test("clicking the section tabs changes the visible working section", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config");
  await expect(page.getByText(BRAND)).toBeVisible();
  await page.getByRole("link", { name: /Session & run/i }).click();
  await expect(page.getByText(SESSION, { exact: true })).toBeVisible();
  await expect(page.getByText(BRAND)).toHaveCount(0);
  await page.getByRole("link", { name: /Campaign assumptions \/ demo numbers/i }).click();
  await expect(page.getByText(NUMBERS)).toBeVisible();
  await expect(page.getByText(SESSION, { exact: true })).toHaveCount(0);
});

// ── /operator deep links still point to the correct hashes ──
test("/operator keeps the /config deep links", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.locator('a[href="/config#brand-media"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#demo-numbers"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#session"]').first()).toBeVisible();
});

// ── Truthfulness retained (Slice 3D-A) ──
test("/config Brand & media keeps the collapsed preset catalogue + honest theme wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Active preset · change preset", { exact: true })).toBeVisible();
  await expect(page.getByText(/show all 12 branded presets/i)).toBeVisible();
  await expect(page.getByText("Operator theme preview", { exact: true })).toBeVisible();
  await expect(page.getByText(/next page load/i)).toBeVisible();
  await expect(page.getByText(/applies to all demo surfaces/i)).toHaveCount(0);
});

test("/config has no visible 'scenario' or 'AI intro' wording (incl. the demo-numbers section)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#demo-numbers");
  await expect(page.getByText(/scenario/i)).toHaveCount(0);
  await expect(page.getByText(/AI intro/i)).toHaveCount(0);
  await page.goto("/config#session");
  await expect(page.getByText(/AI intro/i)).toHaveCount(0);
});
