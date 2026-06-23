import { test, expect, type Page } from "@playwright/test";

/**
 * Brand/media prep surfacing (Slice 3). The operator can see what branding is active and where to prepare it:
 * /operator surfaces a read-only active-branding summary + a first-class brand/media setup action; /config groups
 * the brand/media controls under a findable section; /setup reads as a reference/slot guide, not the setup page.
 * IA/copy only — deterministic, no Supabase. Operator pre-unlocked where gated.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── /operator: lanes intact + brand/media prep surfaced ──
test("/operator keeps the three lanes and surfaces the active-demo branding state", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByRole("heading", { name: "Design demo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Preview client tour" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run live demo" })).toBeVisible();
  // Active-demo card answers "what brand is active / are custom assets on" from existing state.
  await expect(page.getByText("Active demo", { exact: true })).toBeVisible();
  await expect(page.getByText(/Custom assets/i).first()).toBeVisible();
  // First-class brand/media setup action → deep-linked /config.
  await expect(page.getByRole("link", { name: /brand & media setup/i }).first()).toBeVisible();
  await expect(page.locator('a[href^="/config"]').first()).toBeVisible();
});

test("/operator labels /config and /setup distinctly", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/Detailed config \/ brand & media setup/i).first()).toBeVisible();
  await expect(page.getByText(/Asset reference \/ slot guide/i)).toBeVisible();
});

// ── /config: brand/media section is findable + shows current state (existing values only) ──
test("/config exposes a Brand & media setup section + current brand/media state", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config");
  await expect(page.getByRole("heading", { name: /Brand & media setup/i }).first()).toBeVisible();
  await expect(page.locator('a[href$="#brand-media"]').first()).toBeVisible();
  await expect(page.getByText("Current demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Where assets appear", { exact: true })).toBeVisible();
  await expect(page.getByText(/Used on TV\/audience screen/i).first()).toBeVisible();
  await expect(page.getByText(/Used on client preview/i).first()).toBeVisible();
});

test("/config renames the scenario section to campaign assumptions / demo numbers", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#demo-numbers");
  await expect(page.getByRole("heading", { name: /Campaign assumptions \/ demo numbers/i }).first()).toBeVisible();
  await expect(page.getByText(/scenario override/i)).toHaveCount(0);
});

// ── /setup: reference / slot guide, not the main upload/setup path ──
test("/setup reads as an asset reference / slot guide pointing back to /config", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /Asset reference \/ slot guide/i })).toBeVisible();
  await expect(page.getByText(/slot guide only/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /brand & media setup/i }).first()).toBeVisible();
  await expect(page.locator('a[href^="/config"]').first()).toBeVisible();
});

// ── Guardrails: no misleading / out-of-scope wording introduced on /operator ──
test("/operator avoids Prepare scenario / Play AI intro / CMS / AI generation / Ambient wording", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  for (const t of [/Prepare scenario/i, /Play AI intro/i, /\bCMS\b/i, /AI generation/i, /Ambient/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});
