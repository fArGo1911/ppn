import { test, expect } from "@playwright/test";

/**
 * /setup operational asset guide polish (Slice 3D-C). /setup is a professional operator asset guide: a prominent
 * "Configure / upload assets in detailed config" action, required/recommended/optional groupings, compact spec
 * cards (no giant empty boxes), surface grouping, and a collapsed advanced reference. Reference only — upload
 * stays in /config#brand-media. Deterministic, no Supabase.
 */

test("/setup has a prominent Configure / upload action pointing to /config#brand-media", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: /Asset reference \/ slot guide/i })).toBeVisible();
  await expect(page.getByText(/slot guide only/i)).toBeVisible();
  const cta = page.getByRole("link", { name: /Configure \/ upload assets in detailed config/i });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/config#brand-media");
});

test("/setup advanced reference is collapsible and secondary (closed by default)", async ({ page }) => {
  await page.goto("/setup");
  // The advanced section is built from <details>, none open by default → it doesn't dominate the page.
  await expect(page.locator("#advanced-reference details").first()).toBeVisible();
  await expect(page.locator("#advanced-reference details[open]")).toHaveCount(0);
  // A representative advanced summary is present (collapsed) — and renamed away from "AI host scripts".
  await expect(page.getByText(/Host script reference/i)).toBeVisible();
});

test("/setup has no AI-event-intro-script / Play-AI-intro / scenario / generated-graphics wording", async ({ page }) => {
  await page.goto("/setup");
  for (const t of [/AI event intro script/i, /AI host scripts/i, /Play AI intro/i, /scenario/i, /generated graphics/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});
