import { test, expect, type Page } from "@playwright/test";

/**
 * PPN brief-to-brand alignment (Phase 7). When a demo brief is prepared, client-facing surfaces must show the
 * brief's client identity — never another brewery's name in the top chrome — and must not leak internal route /
 * tool names or repeated "POC" wording. Deterministic; no Supabase (KPI pages are pure model).
 */
const HARBOURLINE = {
  clientName: "Harbourline Brewery", campaignName: "Harbourline Quiz Series", exampleVenueName: "The Lighthouse",
  marketRegion: "United Kingdom · Bristol", objectiveIds: ["weekday_footfall", "sponsor_engagement"],
  desiredOutcomeText: "Fill quiet Tuesdays and give the brewery measurable trade-marketing proof.",
  targetVenues: 30, eventsPerVenue: 4, expectedPlayersPerEvent: 70, expectedPlayersPerTeam: 4.5,
  completionRate: 0.92, sponsoredAnswerRate: 0.87, reachMultiplier: 1.5, valuePerVisit: 6,
  pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, venueProfile: "mixed", setupMode: "tv_audio",
};

async function seedBrief(page: Page) {
  await page.addInitScript((b) => localStorage.setItem("ppn_demo_brief", JSON.stringify(b)), HARBOURLINE);
}
const header = (page: Page) => page.locator('[data-testid="demo-shell"] > div').first();

// ── A. Brief identity reaches /presentation; no Northgate, no internal leaks ──
test("brief identity reaches /presentation and the header is not Northgate", async ({ page }) => {
  await seedBrief(page);
  await page.goto("/presentation");
  await expect(header(page)).toContainText("Harbourline Brewery");
  await expect(header(page)).not.toContainText("Northgate");
  await expect(page.getByText("Harbourline Quiz Series").first()).toBeVisible();
  await expect(page.getByText(/Northgate/)).toHaveCount(0);
  for (const t of [/\/config/i, /Presenter tools/i, /localStorage/i, /\bschema\b/i, /\bRPC\b/i]) {
    await expect(page.getByText(t)).toHaveCount(0);
  }
});

// ── B. Brief identity reaches the client buyer pages; header is the client; no leaks/POC ──
for (const route of ["/kpi", "/report", "/rollout", "/run-sheet"]) {
  test(`brief identity reaches header on ${route} with no internal leaks`, async ({ page }) => {
    await seedBrief(page);
    await page.goto(route);
    // Top chrome shows the brief client, never the preset brewery.
    await expect(header(page)).toContainText("Harbourline Brewery");
    await expect(header(page)).not.toContainText("Northgate");
    // No internal route/tool leaks and no repeated "POC" on the client page.
    for (const t of [/\/config/i, /Presenter tools/i, /\bPOC\b/]) {
      await expect(page.getByText(t)).toHaveCount(0);
    }
  });
}

test("brief campaign name appears on /kpi and /report titles", async ({ page }) => {
  await seedBrief(page);
  await page.goto("/kpi");
  await expect(page.getByRole("heading", { name: "Harbourline Quiz Series" })).toBeVisible();
  await page.goto("/report");
  await expect(page.getByRole("heading", { name: /Harbourline Quiz Series — pilot report/ })).toBeVisible();
});

// ── C. Operator mismatch warning when brief client ≠ active preset ──
test("/operator warns when the brief client does not match the active brand", async ({ page }) => {
  await page.addInitScript((b) => {
    localStorage.setItem("ppn_operator_unlocked", "1");
    localStorage.setItem("ppn_demo_brief", JSON.stringify(b));
  }, HARBOURLINE);
  await page.goto("/operator");
  await expect(page.getByText(/Brief client does not match the active brand/i)).toBeVisible();
  await expect(page.getByText(/Brief client:/)).toContainText("Harbourline Brewery");
  await expect(page.getByText(/Active brand:/)).toContainText("Northgate");
  await expect(page.getByRole("link", { name: /Open detailed config to align/i })).toBeVisible();
});

// ── No-brief fallback: preset identity still shown (no regression) ──
test("with no brief, client pages still show the active preset", async ({ page }) => {
  await page.goto("/kpi");
  await expect(header(page)).toContainText("Northgate");
});

// ── D. Gating invariants unchanged ──
test("gating invariants hold after the brand-identity change", async ({ page }) => {
  await page.goto("/presentation");
  await expect(page.getByText(/operator code/i)).toHaveCount(0); // ungated
  await page.goto("/operator/setup-wizard");
  await expect(page.getByRole("heading", { name: /PPN Demo Control Centre/i })).toBeVisible(); // gated
  await page.goto("/play/DEMO");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
  await expect(page.getByText(/AI host/i)).toHaveCount(0);
  await page.goto("/tv/DEMO");
  await expect(page.getByText(/operator code/i)).toHaveCount(0);
});
