import { test, expect, type Page } from "@playwright/test";

/**
 * /operator IA truth cleanup (Slice 2). /operator is the truthful start point for the POC demo: three lanes
 * (Design demo → Preview client tour → Run live demo) plus appendix, with no misleading "Prepare scenario" /
 * repeated "Open setup" / "Play AI intro" wording. Deterministic; no Supabase. Operator pre-unlocked.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── 1. Start point + three lanes + appendix ──
test("/operator is framed as a start point with three lanes and an appendix", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText("Start here", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/design the demo, preview the client tour, then run the live demo/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Design demo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Preview client tour" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Run live demo" })).toBeVisible();
  await expect(page.getByText(/Appendix \/ supporting material/i)).toBeVisible();
});

// ── 2. Misleading wording removed / replaced ──
test("misleading operator wording is gone (Prepare scenario, Play AI intro, bare Open setup)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/Prepare scenario/i)).toHaveCount(0);
  await expect(page.getByText(/Play AI intro/i)).toHaveCount(0);
  await expect(page.getByText("Open setup", { exact: true })).toHaveCount(0);
  // Replacement wording present.
  await expect(page.getByText(/Campaign assumptions \/ demo numbers/i)).toBeVisible();
  await expect(page.getByText(/feed the KPI, report and rollout/i)).toBeVisible();
});

// ── 3. /config and /setup labelled distinctly (no bare "setup") ──
test("/config and /setup carry distinct, qualified labels", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/Detailed config \/ brand & media setup/i).first()).toBeVisible();
  await expect(page.getByText(/Asset reference \/ slot guide/i)).toBeVisible();
});

// ── 4. Rollout / run-sheet / capabilities sit in the appendix, not the live demo lane ──
test("rollout / run-sheet / capabilities are appendix, not core steps", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  for (const r of ["/rollout", "/run-sheet", "/capabilities"]) {
    // Present, but each appears exactly once (only in the appendix, not duplicated into a lane).
    await expect(page.locator(`a[href="${r}"]`)).toHaveCount(1);
  }
  await expect(page.getByText("Supporting / appendix").first()).toBeVisible();
});

// ── 5. Truthful staged-vs-live wording remains ──
test("content-mix not-live / default-live-demo wording remains truthful", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/Default live demo quiz still active/i)).toBeVisible();
  await expect(page.getByText(/not live runtime|not in the live demo yet|prepared only/i).first()).toBeVisible();
});

// ── 6. Every important route still reachable from /operator ──
const ALL_ROUTES = [
  "/operator/setup-wizard", "/config", "/setup", "/presentation",
  "/tv/DEMO", "/host", "/play/DEMO", "/report", "/kpi", "/rollout", "/run-sheet", "/capabilities",
];
test("all important POC routes are still reachable from /operator", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  for (const r of ALL_ROUTES) {
    await expect(page.locator(`a[href="${r}"]`).first()).toBeVisible();
  }
});
