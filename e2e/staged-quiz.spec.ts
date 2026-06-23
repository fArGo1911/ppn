import { test, expect, type Page } from "@playwright/test";

/**
 * PPN Phase 10A — staged quiz plan PREFLIGHT (no DB writes, no live runtime change). The proposed quiz is staged
 * only; the live demo keeps the default seeded questions. Deterministic; no Supabase.
 */
// Playwright isolates localStorage per test, so each test starts with no staged plan. Only set the unlock flag
// (NOT removeItem) — an init script runs on every navigation/reload, so removing here would wipe a just-staged plan.
async function openWizard(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
  await page.goto("/operator/setup-wizard");
}

// ── Phase 9 preview is clearly "Preview only" ──
test("content step labels the proposed preview as Preview only", async ({ page }) => {
  await openWizard(page);
  await page.getByRole("button", { name: "5 · Quiz content mix" }).click();
  await expect(page.getByText("Preview only").first()).toBeVisible();
});

// ── Invalid total blocks "Save proposed quiz plan" ──
test("invalid content total blocks saving the proposed quiz plan", async ({ page }) => {
  await openWizard(page);
  await page.getByRole("button", { name: "5 · Quiz content mix" }).click();
  const sport = page.getByLabel("Sport / football");
  await sport.focus();
  await sport.press("ArrowRight"); // knock total off 100
  await expect(page.getByTestId("mix-total")).not.toHaveText("100%");
  await page.getByRole("button", { name: "8 · Review & apply" }).click();
  await expect(page.getByRole("button", { name: /Save proposed quiz plan/i })).toBeDisabled();
  await expect(page.getByText(/set it to 100% in Quiz content mix/i)).toBeVisible();
});

// ── Setup-mode incompatibility warning shows before staging ──
test("setup incompatibility warning appears before staging", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_operator_unlocked", "1");
    localStorage.removeItem("ppn_staged_demo_quiz");
    localStorage.setItem("ppn_demo_brief", JSON.stringify({
      clientName: "Demo Co.", campaignName: "Demo", exampleVenueName: "The Pub", marketRegion: "UK",
      objectiveIds: [], desiredOutcomeText: "", targetVenues: 20, eventsPerVenue: 4, expectedPlayersPerEvent: 70,
      expectedPlayersPerTeam: 4.5, completionRate: 0.92, sponsoredAnswerRate: 0.87, reachMultiplier: 1.5, valuePerVisit: 6,
      pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, venueProfile: "mixed", setupMode: "audio_only",
      contentMix: { general: 15, sport: 15, music: 15, local: 10, geography: 10, picture: 15, video: 15, sponsor: 5 },
      contentMixPreset: "popup", quizLength: 20, includeTiebreak: false,
    }));
  });
  await page.goto("/operator/setup-wizard");
  await page.getByRole("button", { name: "8 · Review & apply" }).click();
  await expect(page.getByText(/Video round needs TV\/display support/i)).toBeVisible();
});

// ── Staging saves the plan; /operator shows honest prepared-only wording ──
test("saving stages the plan and /operator shows honest prepared-only status", async ({ page }) => {
  await openWizard(page);
  await page.getByRole("button", { name: "8 · Review & apply" }).click();
  await page.getByRole("button", { name: /Save proposed quiz plan/i }).click();
  await expect(page.getByText(/Custom quiz plan prepared/i)).toBeVisible();
  await expect(page.getByText(/Default live demo quiz still active/i).first()).toBeVisible();

  await page.goto("/operator");
  await expect(page.getByText("Proposed quiz saved")).toBeVisible();
  await expect(page.getByText(/Default live demo quiz still active/i)).toBeVisible();
  await expect(page.getByText(/Runtime apply requires a DB-backed replacement step/i).first()).toBeVisible();
  // No false "applied / custom quiz active / running" claim anywhere on the operator hub.
  await expect(page.getByText(/Applied to demo session/i)).toHaveCount(0);
  await expect(page.getByText(/Custom quiz active/i)).toHaveCount(0);
});

// ── Clearing the staged plan restores the planning state ──
test("clearing the staged plan restores the default-only state", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
  await page.goto("/operator");
  // Seed the staged plan via evaluate (persists across the clear-button reload; an init script would re-add it).
  await page.evaluate(() => localStorage.setItem("ppn_staged_demo_quiz", JSON.stringify({
    id: "plan-x", source: "content_mix_preview", createdAt: "2026-01-01T00:00:00.000Z",
    contentMixPreset: "sports_bar", quizLength: 20, includeTiebreak: false, setupMode: "tv_audio",
    questions: [], tiebreak: null, warnings: [], status: "prepared", runtimeApplied: false,
  })));
  await page.reload();
  await expect(page.getByText("Proposed quiz saved")).toBeVisible();
  await page.getByRole("button", { name: /Clear proposed quiz plan/i }).click();
  await expect(page.getByText(/No custom quiz plan prepared/i)).toBeVisible();
});

// ── /operator default state is honest when nothing is staged ──
test("/operator shows default-quiz state when no plan is staged", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_operator_unlocked", "1");
    localStorage.removeItem("ppn_staged_demo_quiz");
  });
  await page.goto("/operator");
  await expect(page.getByText(/Default live demo quiz still active/i)).toBeVisible();
  await expect(page.getByText(/No custom quiz plan prepared/i)).toBeVisible();
  await expect(page.getByText(/Custom quiz active/i)).toHaveCount(0);
});

// ── Gating invariants unchanged ──
test("gating invariants hold (host/config gated, play/tv ungated)", async ({ page }) => {
  await page.goto("/host");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
  await page.goto("/config");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible();
  await page.goto("/play/DEMO");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
  await page.goto("/tv/DEMO");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
});
