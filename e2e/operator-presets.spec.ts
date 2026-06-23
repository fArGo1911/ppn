import { test, expect, type Page } from "@playwright/test";

/**
 * /operator demo-preset visibility (Slice 3B-A). /operator must visibly support multiple branded demos (presets)
 * and a custom-client-demo concept — not look like one hardcoded Northgate demo — while keeping the three lanes.
 * IA/design only; deterministic, no Supabase. Operator pre-unlocked.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── Active demo + Available demo presets ──
test("/operator shows an Active demo and an Available demo presets grid (not one hardcoded demo)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText("Active demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Available demo presets", { exact: true })).toBeVisible();
  // Northgate is the active preset…
  await expect(page.getByText(/Northgate Brewing Co\./).first()).toBeVisible();
  await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
  // …and at least two other existing presets are visible.
  await expect(page.getByText(/Crimson & Co\. Brewery/).first()).toBeVisible();
  await expect(page.getByText(/Adlerbräu München/).first()).toBeVisible();
});

// ── Copy polish: neutral heading + no visible "scenario" wording ──
test("/operator has a neutral heading (not one Northgate demo) and no visible 'scenario' wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Northgate");
  await expect(page.getByRole("heading", { name: /branded client demo/i })).toBeVisible();
  await expect(page.getByText(/scenario/i)).toHaveCount(0);
  // The active selected demo is still clearly Northgate (inside the Active demo card).
  await expect(page.getByText(/Northgate Brewing Co\./).first()).toBeVisible();
});

// ── Custom client demo: concept-only, not a built workflow ──
test("/operator shows a concept-only Custom client demo card", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/Custom client demo/i).first()).toBeVisible();
  await expect(page.getByText(/Concept · configure in detailed config/i)).toBeVisible();
  await expect(page.getByText(/no self-service builder/i)).toBeVisible();
});

// ── Lanes + appendix preserved ──
test("/operator keeps the three lanes and appendix", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByRole("heading", { name: "Design demo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Preview client tour" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run live demo" })).toBeVisible();
  await expect(page.getByText(/Appendix \/ supporting material/i)).toBeVisible();
});

// ── Deep links into /config anchors ──
test("/operator deep-links into /config#brand-media, #demo-numbers, #session", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.locator('a[href="/config#brand-media"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#demo-numbers"]').first()).toBeVisible();
  await expect(page.locator('a[href="/config#session"]').first()).toBeVisible();
});

// ── Surface coverage preserved ──
test("/operator still reaches every other important surface", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  for (const r of ["/operator/setup-wizard", "/presentation", "/tv/DEMO", "/play/DEMO", "/host", "/report", "/kpi", "/rollout", "/run-sheet", "/capabilities", "/setup"]) {
    await expect(page.locator(`a[href="${r}"]`).first()).toBeVisible();
  }
});

// ── Guardrails: no retired or out-of-scope wording introduced ──
test("/operator avoids Prepare scenario / Play AI intro / CMS / AI generation / Ambient wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  for (const t of [/Prepare scenario/i, /Play AI intro/i, /\bCMS\b/i, /AI generation/i, /Ambient/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});
