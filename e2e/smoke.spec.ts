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

// ── B. Operator gate ──
test("operator gate blocks /config when locked", async ({ page }) => {
  await page.goto("/config");
  await expect(page.getByText(/enter the demo operator code/i)).toBeVisible();
});

test("operator gate blocks /host when locked", async ({ page }) => {
  await page.goto("/host");
  await expect(page.getByText(/enter the demo operator code/i)).toBeVisible();
});

test("correct code unlocks /config", async ({ page }) => {
  await page.goto("/config");
  await page.getByPlaceholder("operator code").fill(CODE);
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByText(/run the demo/i)).toBeVisible();
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
  await expect(page.getByText(/enter the demo operator code/i)).toBeVisible();
});

test("/operator shows status, guided journey, surface buttons and route groups when unlocked", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText(/demo control centre/i)).toBeVisible();
  await expect(page.getByText("Active demo")).toBeVisible();
  await expect(page.getByText(/guided demo journey/i)).toBeVisible();
  // Open-surface buttons exist (new-tab anchors).
  await expect(page.getByRole("link", { name: /Open TV/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Host/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Player/ }).first()).toBeVisible();
  // Free-exploration route groups + persona warning.
  await expect(page.getByText("Operator prep")).toBeVisible();
  await expect(page.getByText(/never show a client/i)).toBeVisible();
});
