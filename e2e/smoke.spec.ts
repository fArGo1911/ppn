import { test, expect, type Page } from "@playwright/test";

/**
 * PPN operator-journey smoke. Deterministic + fast; does NOT require local Supabase for the assertions below
 * (Supabase-backed content like live teams is intentionally not asserted). Operator code falls back to "demo".
 */
const CODE = process.env.VITE_PPN_OPERATOR_CODE ?? "demo";

// Pre-unlock the operator gate on this device for tests that need the controls.
async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── A. Presentation routes load (clean presentation shell) ──
const PRESENTATION = ["/", "/kpi", "/report", "/rollout", "/run-sheet", "/capabilities", "/setup"];
for (const route of PRESENTATION) {
  test(`presentation route loads: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByTestId("demo-shell")).toBeVisible();
    // No operator code gate on presentation pages.
    await expect(page.getByText(/operator code/i)).toHaveCount(0);
  });
}

// ── D. Buyer pages must NOT show the old operator route bar (a <nav> inside the demo shell) ──
for (const route of ["/", "/report", "/kpi"]) {
  test(`no operator nav bar on buyer page: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-testid="demo-shell"] nav')).toHaveCount(0);
    // The retired route bar exposed a "Brand assets" link in the header — must be gone there.
    await expect(page.locator('[data-testid="demo-shell"] header a', { hasText: "Brand assets" })).toHaveCount(0);
  });
}

// ── B. Operator gate (polished product entry) ──
test("operator gate blocks /config when locked + shows polished control-centre copy", async ({ page }) => {
  await page.goto("/config");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
  await expect(page.getByText(/enter the operator code/i)).toBeVisible();
});

test("operator gate blocks /host when locked", async ({ page }) => {
  await page.goto("/host");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
});

test("correct code unlocks /config and shows clean asset IA (no stale copy)", async ({ page }) => {
  await page.goto("/config");
  await page.getByPlaceholder("operator code").fill(CODE);
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByText(/run the demo/i)).toBeVisible();
  // Current-demo status + separated manual vs upload asset modes (Card titles render as <p>).
  await expect(page.getByText("Current demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Quick manual paths", { exact: true })).toBeVisible();
  await expect(page.getByText(/Upload asset pack/).first()).toBeVisible();
  await expect(page.getByText("Where assets appear", { exact: true })).toBeVisible();
  // Stale contradictory copy must be gone.
  await expect(page.getByText(/no upload or storage yet/i)).toHaveCount(0);
});

test("/play/DEMO is not gated and has no AI-host/script exposure", async ({ page }) => {
  await page.goto("/play/DEMO");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
  await expect(page.getByText(/AI host/i)).toHaveCount(0);
});

test("/tv/DEMO is not gated", async ({ page }) => {
  await page.goto("/tv/DEMO");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
});

// ── C. Operator Demo Control Centre ──
test("/operator is gated when locked", async ({ page }) => {
  await page.goto("/operator");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
});

test("/operator shows current demo, guided journey, surface buttons and free exploration", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/demo control centre/i)).toBeVisible();
  await expect(page.getByText("Current demo")).toBeVisible();
  await expect(page.getByText(/guided demo journey/i)).toBeVisible();
  await expect(page.getByText(/free exploration/i)).toBeVisible();
  // Open-surface buttons exist (new-tab anchors).
  await expect(page.getByRole("link", { name: /Open TV/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Host/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Player/ }).first()).toBeVisible();
  // Free-exploration route groups + persona warning.
  await expect(page.getByText("Operator prep")).toBeVisible();
  await expect(page.getByText(/never show a client/i)).toBeVisible();
});

test("/operator surfaces wrong-client override warning + clear action when overrides are set", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_operator_unlocked", "1");
    localStorage.setItem("ppn_asset_pack", JSON.stringify({ sponsorName: "Other Client Co." }));
  });
  await page.goto("/operator");
  await expect(page.getByText(/client overrides are active/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /clear client overrides/i })).toBeVisible();
});
