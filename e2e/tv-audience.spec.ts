import { test, expect, type Page } from "@playwright/test";

/**
 * TV / audience-surface showcase cleanup (P1). The public /tv and /play surfaces must look like a clean venue
 * display: no presenter chrome, no host-script cards, no fake/empty "Brewery video" placeholder — while still
 * showing the polished welcome/QR/sponsor vision. Deterministic; no Supabase required (welcome state renders
 * from the client-facing identity / DEMO fallback).
 */

const pill = (page: Page) => page.getByRole("button", { name: "Presenter", exact: true });

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── 1. Presenter pill is hidden by default on public routes ──
for (const route of ["/tv/DEMO", "/play/DEMO", "/", "/report", "/kpi", "/presentation"]) {
  test(`no Presenter pill on public route by default: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(pill(page)).toHaveCount(0);
  });
}

// ── 2. Public TV welcome is audience-safe: no host script, no fake video placeholder ──
test("/tv/DEMO welcome shows no host-script card and no fake Brewery-video placeholder", async ({ page }) => {
  await page.goto("/tv/DEMO");
  // Host-script "Tonight's intro" card (the old AiAnnouncementSlot) must be gone.
  await expect(page.getByText(/Tonight.s intro/i)).toHaveCount(0);
  // The old empty/fake playable placeholder text must be gone.
  await expect(page.getByText(/Brewery video/i)).toHaveCount(0);
  // No internal "AI host"/script leakage.
  await expect(page.getByText(/AI host/i)).toHaveCount(0);
});

// ── 3. Public TV welcome still shows the polished startup + QR/join vision ──
test("/tv/DEMO welcome still shows an audience-safe startup + QR/join", async ({ page }) => {
  // Pin the welcome state: with a live local-Supabase session the loop can resolve to tv_off mid-test (race),
  // so assert the welcome surface deterministically via the presenter ?state override (disables the live query).
  await page.goto("/tv/DEMO?state=welcome");
  await expect(page.getByText("Scan to join", { exact: true })).toBeVisible();
  await expect(page.getByText(/Tonight.s quiz starts soon/i).first()).toBeVisible();
  // Join code is shown as a no-app fallback; a QR <svg> is rendered.
  await expect(page.getByText("DEMO").first()).toBeVisible();
  await expect(page.locator("svg").first()).toBeVisible();
  // The polished branded sponsor fallback is shown in place of the empty video panel.
  await expect(page.getByText(/sponsor feature/i).first()).toBeVisible();
});

// ── 4. Presenter access is preserved behind explicit context ──
test("?present=1 reveals the Presenter pill on /tv (operator access preserved)", async ({ page }) => {
  await page.goto("/tv/DEMO?present=1");
  await expect(pill(page)).toBeVisible();
});

test("an unlocked operator still sees the Presenter pill on /tv", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/tv/DEMO");
  await expect(pill(page)).toBeVisible();
});

// ── 5. Host-script / narration material is retained where it belongs (not on public TV) ──
test("/setup retains the host-script reference material (not leaked onto /tv)", async ({ page }) => {
  await page.goto("/setup");
  await expect(page.getByText(/Host script reference/i)).toBeVisible();
});

// ── 6. Existing TV client-safety invariants still hold (no sample video embed) ──
test("/tv/DEMO still embeds no sample video", async ({ page }) => {
  await page.goto("/tv/DEMO");
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
});
