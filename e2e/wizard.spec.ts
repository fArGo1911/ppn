import { test, expect, type Page } from "@playwright/test";

/**
 * PPN internal setup-wizard smoke (journey 1). Deterministic + fast; does NOT require local Supabase
 * (the wizard's KPI outputs are pure arithmetic over the seeded model). Operator code falls back to "demo".
 * Gating / buyer-nav / play-tv-ungated invariants are covered in smoke.spec.ts; here we focus on the wizard.
 */
const CODE = process.env.VITE_PPN_OPERATOR_CODE ?? "demo";

// Pre-unlock the operator gate. Playwright isolates localStorage per test, so each test starts with no brief.
async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── /operator surfaces the internal setup wizard entry ──
test("/operator shows 'Set up a client demo' with a start button", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await expect(page.getByText("Set up a client demo")).toBeVisible();
  await expect(page.getByRole("link", { name: /Start setup wizard/i })).toBeVisible();
});

// ── /operator/setup-wizard is gated when locked ──
test("/operator/setup-wizard is gated when locked", async ({ page }) => {
  await page.goto("/operator/setup-wizard");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
});

// ── Unlock + open the wizard from /operator, then walk every step ──
test("wizard opens and walks all steps; assets/readiness is last", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await page.getByRole("link", { name: /Start setup wizard/i }).click();
  await expect(page).toHaveURL(/\/operator\/setup-wizard$/);

  // Clearly internal setup — not a client presentation flow.
  await expect(page.getByRole("heading", { name: /Demo brief & content mix/i })).toBeVisible();
  await expect(page.getByText(/Internal only; never shown to the client/i)).toBeVisible();

  // Step 1 — Client basics
  await expect(page.getByRole("heading", { name: "Client basics" })).toBeVisible();
  await expect(page.getByLabel("Client / brewery name")).toBeVisible();

  // Step 2 — Desired outcome
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: "Desired outcome" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Show sponsor engagement/i })).toBeVisible();

  // Step 3 — Scale & reach
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: "Scale & reach" })).toBeVisible();
  await expect(page.getByTestId("wizard-outputs")).toBeVisible();

  // Step 4 — Venue mix
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: "Venue mix" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sports bar/i }).first()).toBeVisible();

  // Step 5 — Quiz content mix
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: "Quiz content mix" })).toBeVisible();
  await expect(page.getByTestId("quiz-preview")).toBeVisible();

  // Step 6 — Setup mode
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: "Setup mode" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Audio-only/i })).toBeVisible();

  // Step 7 — Readiness & assets (LAST / separate, graphics come last)
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: "Readiness & assets" })).toBeVisible();
  await expect(page.getByText(/Add graphics last — once/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Open asset setup/i })).toBeVisible();

  // Step 7 — Review & apply
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByRole("heading", { name: /Review & apply/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply scenario to demo" })).toBeVisible();
});

// ── Dynamic outputs update when scale inputs change ──
test("scale inputs update the calculated outputs", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator/setup-wizard");
  await page.getByRole("button", { name: "3 · Scale & reach" }).click();

  const players = page.getByTestId("out-players");
  const before = (await players.textContent())?.trim();

  // Double the target venues — estimated players reached must change.
  const venues = page.getByLabel("Target pubs / venues");
  await venues.fill("200");
  await venues.blur();

  await expect(players).not.toHaveText(before ?? "");
});

// ── Apply saves the brief; /operator then shows the saved summary ──
test("applying saves the brief and /operator shows client/campaign/target reach", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator/setup-wizard");

  await page.getByLabel("Client / brewery name").fill("Pinegate Test Brewery");
  await page.getByLabel("Demo / campaign name").fill("Pinegate Quiz Pilot");

  // Jump to review and apply.
  await page.getByRole("button", { name: "8 · Review & apply" }).click();
  await page.getByRole("button", { name: "Apply scenario to demo" }).click();
  await expect(page.getByText(/scenario applied/i)).toBeVisible();

  // Back on /operator the saved brief summary shows (operator stays unlocked via initScript).
  await page.goto("/operator");
  await expect(page.getByText("Brief saved")).toBeVisible();
  await expect(page.getByText(/Pinegate Test Brewery/).first()).toBeVisible();
  await expect(page.getByText(/Pinegate Quiz Pilot/).first()).toBeVisible();
  await expect(page.getByText(/Target reach:/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Edit setup wizard/i }).first()).toBeVisible();
});

// ── Wrong-client protection: a loaded brief warns + offers clear-and-start-new ──
test("wizard warns when a saved brief is already loaded", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_operator_unlocked", "1");
    localStorage.setItem("ppn_demo_brief", JSON.stringify({
      clientName: "Existing Client Co.", campaignName: "Existing Campaign", exampleVenueName: "The Test Arms",
      marketRegion: "United Kingdom · Greater Manchester", objectiveIds: [], desiredOutcomeText: "",
      targetVenues: 20, eventsPerVenue: 4, expectedPlayersPerEvent: 70, expectedPlayersPerTeam: 4.5,
      completionRate: 0.92, sponsoredAnswerRate: 0.87, reachMultiplier: 1.5, valuePerVisit: 6,
      pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, venueProfile: "mixed", setupMode: "tv_audio",
    }));
  });
  await page.goto("/operator/setup-wizard");
  await expect(page.getByText(/A saved demo brief is loaded/i)).toBeVisible();
  await expect(page.getByText(/Existing Client Co\./)).toBeVisible();
  await expect(page.getByRole("button", { name: /Clear & start new client/i })).toBeVisible();
});
