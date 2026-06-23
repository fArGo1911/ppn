import { test, expect, type Page } from "@playwright/test";

/**
 * Operator recovery + helper route-map coverage (Slice 1). The operator must never be trapped in Audience mode,
 * and the presenter floater must expose every important POC route, clearly labelled by role. Deterministic; no
 * Supabase (the floater + gate render without it). Presenter context = operator unlocked on the device.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}
const pill = (page: Page) => page.getByRole("button", { name: /Presenter tools/ });
const exitBtn = (page: Page) => page.getByRole("button", { name: /Exit audience mode/i });

async function openMenu(page: Page) {
  await pill(page).click();
  await expect(page.getByTestId("presenter-menu")).toBeVisible();
}

const ALL_ROUTES = [
  "/operator", "/operator/setup-wizard", "/config", "/setup",
  "/presentation", "/kpi", "/report", "/rollout", "/run-sheet", "/capabilities",
  "/tv/DEMO", "/host", "/play/DEMO",
];
const ROLE_LABELS = ["Operator-only", "Client-safe", "Guest / player", "TV / audience", "Reference"];

// ── 1. Audience mode is reversible — the operator is never trapped ──
test("entering audience mode shows a VISIBLE exit control and recovers in one click", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await openMenu(page);
  await page.getByRole("button", { name: "▶ Enter audience mode", exact: true }).click();
  // Presenter pill is hidden, but a genuinely visible recovery control is present (not an invisible hotspot).
  await expect(pill(page)).toHaveCount(0);
  await expect(exitBtn(page)).toBeVisible();
  // One click returns to operator controls.
  await exitBtn(page).click();
  await expect(pill(page)).toBeVisible();
});

test("/operator is reachable + recoverable after audience mode is already on", async ({ page }) => {
  await unlockOperator(page);
  await page.addInitScript(() => localStorage.setItem("ppn_audience", "1"));
  await page.goto("/operator");
  // The operator page itself still renders (audience mode doesn't block it)...
  await expect(page.getByText(/demo control centre/i).first()).toBeVisible();
  // ...and the visible recovery control lets the operator get controls back.
  await expect(exitBtn(page)).toBeVisible();
  await exitBtn(page).click();
  await expect(pill(page)).toBeVisible();
});

// ── 2/3. Helper route map covers every important POC route ──
test("helper route map links to every important POC route", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await openMenu(page);
  const menu = page.getByTestId("presenter-menu");
  for (const r of ALL_ROUTES) {
    await expect(menu.locator(`a[href="${r}"]`)).toHaveCount(1);
  }
});

// ── 4. Routes are labelled by role (operator / client / guest / TV / reference) ──
test("helper route map labels every role", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await openMenu(page);
  const menu = page.getByTestId("presenter-menu");
  for (const role of ROLE_LABELS) {
    await expect(menu.getByText(role, { exact: true }).first()).toBeVisible();
  }
});

// ── 5. Public surfaces stay guest-safe (no chrome) without presenter context ──
for (const r of ["/tv/DEMO", "/play/DEMO"]) {
  test(`public ${r} shows no presenter pill and no exit control by default`, async ({ page }) => {
    await page.goto(r);
    await expect(pill(page)).toHaveCount(0);
    await expect(exitBtn(page)).toHaveCount(0);
  });
}

test("a guest with the audience flag set still sees no chrome on /tv (safe by default)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ppn_audience", "1"));
  await page.goto("/tv/DEMO");
  await expect(pill(page)).toHaveCount(0);
  await expect(exitBtn(page)).toHaveCount(0);
});

// ── 6. Gating preserved ──
for (const r of ["/host", "/operator", "/config"]) {
  test(`gated route still gated when locked: ${r}`, async ({ page }) => {
    await page.goto(r);
    await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
  });
}
