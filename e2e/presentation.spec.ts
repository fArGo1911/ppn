import { test, expect, type Page } from "@playwright/test";

/**
 * PPN client-facing presentation journey (journey 2). Deterministic + fast; does NOT require local Supabase.
 * The presentation is read-only and client-safe — it must never expose internal setup surfaces/terms.
 */

// ── /presentation loads ungated with a client-facing heading ──
test("/presentation loads without operator gate and shows a client-facing heading", async ({ page }) => {
  await page.goto("/presentation");
  await expect(page.getByTestId("demo-shell")).toBeVisible();
  await expect(page.getByText(/operator code/i)).toHaveCount(0); // not gated
  await expect(page.getByText("Client presentation").first()).toBeVisible();
});

// ── It must not leak internal setup surfaces / language ──
test("/presentation hides internal setup language", async ({ page }) => {
  await page.goto("/presentation");
  for (const term of [/\/config/i, /setup wizard/i, /localStorage/i, /\bschema\b/i, /\bRPC\b/i, /operator gate/i]) {
    await expect(page.getByText(term)).toHaveCount(0);
  }
  // No operator route bar (this is a client surface).
  await expect(page.locator('[data-testid="demo-shell"] nav')).toHaveCount(0);
});

// ── Live surfaces: TV + Player links present (and clearly client-safe) ──
test("/presentation links to TV and Player surfaces", async ({ page }) => {
  await page.goto("/presentation");
  await page.getByRole("button", { name: "4 · Live demo" }).click();
  await expect(page.getByRole("link", { name: /Open TV display/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open player phone/i })).toBeVisible();
  // Host is described as a private console, not a prominent client link.
  await expect(page.getByText(/private console/i)).toBeVisible();
});

// ── Proof + rollout: KPI/report and rollout/run-sheet links present ──
test("/presentation links to KPI/report and rollout/run-sheet", async ({ page }) => {
  await page.goto("/presentation");
  await page.getByRole("button", { name: "6 · Measurement" }).click();
  await expect(page.getByRole("link", { name: /View KPI report/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /View pilot report/i })).toBeVisible();
  await page.getByRole("button", { name: "7 · Rollout" }).click();
  await expect(page.getByRole("link", { name: /View rollout plan/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /View venue run sheet/i })).toBeVisible();
});

// ── Uses the demo brief data when one is prepared ──
test("/presentation uses demo brief data when present", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_demo_brief", JSON.stringify({
      clientName: "Harbourline Brewery", campaignName: "Harbourline Quiz Series", exampleVenueName: "The Lighthouse",
      marketRegion: "United Kingdom · Bristol", objectiveIds: ["weekday_footfall"], desiredOutcomeText: "Fill quiet Tuesdays.",
      targetVenues: 30, eventsPerVenue: 4, expectedPlayersPerEvent: 70, expectedPlayersPerTeam: 4.5,
      completionRate: 0.92, sponsoredAnswerRate: 0.87, reachMultiplier: 1.5, valuePerVisit: 6,
      pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, venueProfile: "mixed", setupMode: "tv_audio",
    }));
  });
  await page.goto("/presentation");
  await expect(page.getByText("Harbourline Quiz Series").first()).toBeVisible();
  await expect(page.getByText(/Harbourline Brewery/).first()).toBeVisible();
  // Brief desired outcome surfaces in step 1.
  await expect(page.getByText(/Fill quiet Tuesdays/)).toBeVisible();
});

// ── No brief → polished fallback (active preset), not an error ──
test("/presentation falls back to the active preset when no brief exists", async ({ page }) => {
  await page.goto("/presentation");
  await expect(page.getByText("Client presentation").first()).toBeVisible();
  // Default preset is Northgate — campaign copy renders, no error text.
  await expect(page.getByText(/Northgate/).first()).toBeVisible();
  await expect(page.getByText(/error/i)).toHaveCount(0);
});

// ── /operator links to the client presentation (operator must be unlocked) ──
test("/operator offers an 'Open client presentation' action", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
  await page.goto("/operator");
  await expect(page.getByRole("link", { name: /Open client presentation/i })).toBeVisible();
});

// ── Invariants: setup wizard stays gated; presentation does not gate ──
test("/operator/setup-wizard stays gated while /presentation does not", async ({ page }) => {
  await page.goto("/operator/setup-wizard");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
  await page.goto("/presentation");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
});
