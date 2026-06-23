import { test, expect, type Page } from "@playwright/test";

/**
 * PPN venue content mix + preview quiz (Phase 9). Deterministic; no Supabase (pure seeded pool + arithmetic).
 * Music, Picture round and Video round are SEPARATE categories. The wizard's content step is internal setup only.
 */
async function openContentStep(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
  await page.goto("/operator/setup-wizard");
  await page.getByRole("button", { name: "5 · Quiz content mix" }).click();
  await expect(page.getByRole("heading", { name: "Quiz content mix" })).toBeVisible();
}

// ── Step exists with separate Music / Picture / Video categories + total indicator ──
test("content mix step has separate Music/Picture/Video sliders and a total", async ({ page }) => {
  await openContentStep(page);
  for (const cat of ["General knowledge", "Sport / football", "Music", "Local / venue", "Geography / culture", "Picture round", "Video round", "Sponsor / brand"]) {
    await expect(page.getByLabel(cat)).toBeVisible();
  }
  await expect(page.getByTestId("mix-total")).toBeVisible();
});

// ── Preset selector applies a mix that totals 100 ──
test("preset selector works (Sports bar → 60% sport, total 100)", async ({ page }) => {
  await openContentStep(page);
  await page.getByRole("button", { name: "Sports bar" }).click();
  await expect(page.getByTestId("mix-sport")).toHaveText("60%");
  await expect(page.getByTestId("mix-total")).toHaveText("100%");
});

// ── Changing a slider changes the total + composition; normalise restores 100 ──
test("changing a slider changes the total and normalise restores 100", async ({ page }) => {
  await openContentStep(page);
  const compDefault = (await page.getByTestId("mix-composition").textContent())?.trim();
  await page.getByRole("button", { name: "Sports bar" }).click();
  await expect(page.getByTestId("mix-composition")).not.toHaveText(compDefault ?? ""); // composition changed

  const sport = page.getByLabel("Sport / football");
  await sport.focus();
  await sport.press("ArrowRight"); // 60 → 65
  await expect(page.getByTestId("mix-sport")).toHaveText("65%");
  await expect(page.getByTestId("mix-total")).toHaveText("105%"); // total changed

  await page.getByRole("button", { name: "Normalise to 100%" }).click();
  await expect(page.getByTestId("mix-total")).toHaveText("100%");
});

// ── Sponsor-heavy warning ──
test("sponsor-heavy mix warns it may feel sales-heavy", async ({ page }) => {
  await openContentStep(page);
  const sponsor = page.getByLabel("Sponsor / brand");
  await sponsor.focus();
  for (let i = 0; i < 4; i++) await sponsor.press("ArrowRight"); // 5 → 25
  await expect(page.getByTestId("mix-sponsor")).toHaveText("25%");
  await expect(page.getByText(/Sponsor \/ brand is 25%/i)).toBeVisible();
});

// ── Media-heavy warning (picture + video) ──
test("media-heavy preset warns about asset/TV readiness", async ({ page }) => {
  await openContentStep(page);
  await page.getByRole("button", { name: "Pop-up / event" }).click();
  await expect(page.getByText(/Picture \+ Video is 30%/i)).toBeVisible();
});

// ── Setup-mode compatibility warning (audio-only + video) ──
test("audio-only setup warns about a video round in the mix", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_operator_unlocked", "1");
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
  await page.getByRole("button", { name: "5 · Quiz content mix" }).click();
  await expect(page.getByText(/Video round needs TV\/display support/i)).toBeVisible();
});

// ── Proposed quiz preview: category-labelled questions, with a high-weight category present ──
test("proposed quiz preview shows category-labelled questions from the high-weight category", async ({ page }) => {
  await openContentStep(page);
  await page.getByRole("button", { name: "Sports bar" }).click();
  const preview = page.getByTestId("quiz-preview");
  await expect(preview).toBeVisible();
  await expect(preview.getByText("Sport / football").first()).toBeVisible(); // high-weight category appears
});

// ── Picture/Video preview questions are labelled as picture/video ──
test("preview labels picture and video round questions", async ({ page }) => {
  await openContentStep(page);
  await page.getByRole("button", { name: "Pop-up / event" }).click();
  const preview = page.getByTestId("quiz-preview");
  await expect(preview.getByText("Picture round").first()).toBeVisible();
  await expect(preview.getByText("Video round").first()).toBeVisible();
  await expect(preview.getByText(/Look at the image/i).first()).toBeVisible();
});

// ── Applying saves the content mix; /operator summarises it ──
test("applying saves the content mix and /operator summarises it", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
  await page.goto("/operator/setup-wizard");
  await page.getByRole("button", { name: "5 · Quiz content mix" }).click();
  await page.getByRole("button", { name: "Sports bar" }).click();
  await page.getByRole("button", { name: "8 · Review & apply" }).click();
  await page.getByRole("button", { name: "Apply scenario to demo" }).click();
  await expect(page.getByText(/scenario applied/i)).toBeVisible();

  await page.goto("/operator");
  await expect(page.getByText(/Content mix: Sports bar/i)).toBeVisible();
  await expect(page.getByText(/Sport \/ football 60%/i)).toBeVisible();
});

// ── /presentation shows a client-safe content profile (no sliders/percentages) ──
test("/presentation shows a client-safe content profile", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ppn_demo_brief", JSON.stringify({
      clientName: "Harbourline Brewery", campaignName: "Harbourline Quiz Series", exampleVenueName: "The Lighthouse",
      marketRegion: "United Kingdom · Bristol", objectiveIds: [], desiredOutcomeText: "",
      targetVenues: 30, eventsPerVenue: 4, expectedPlayersPerEvent: 70, expectedPlayersPerTeam: 4.5,
      completionRate: 0.92, sponsoredAnswerRate: 0.87, reachMultiplier: 1.5, valuePerVisit: 6,
      pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, venueProfile: "mixed", setupMode: "tv_audio",
      contentMix: { general: 10, sport: 60, music: 10, local: 10, geography: 5, picture: 0, video: 0, sponsor: 5 },
      contentMixPreset: "sports_bar", quizLength: 20, includeTiebreak: false,
    }));
  });
  await page.goto("/presentation");
  await page.getByRole("button", { name: "3 · The pub night" }).click();
  await expect(page.getByText(/Prepared content profile · Sports bar/i)).toBeVisible();
  await expect(page.getByText(/weighted towards/i)).toBeVisible();
  // No internal slider/percentage exposure on the client page.
  await expect(page.getByTestId("mix-total")).toHaveCount(0);
});

// ── Report + run-sheet surface a client-safe content profile (no sliders, honest "can be tailored") ──
test("/report and /run-sheet show a client-safe content profile", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByText(/Content profile:/i)).toBeVisible();
  await expect(page.getByText(/final questions can be tailored per venue before launch/i)).toBeVisible();
  await expect(page.getByTestId("mix-total")).toHaveCount(0);

  await page.goto("/run-sheet");
  await expect(page.getByText(/Tonight's content profile/i)).toBeVisible();
  await expect(page.getByText(/final questions can be tailored before the event/i)).toBeVisible();
  await expect(page.getByTestId("mix-total")).toHaveCount(0);
});
