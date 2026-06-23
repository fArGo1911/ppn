import { test, expect, type Page } from "@playwright/test";

/**
 * Slice 3F-C — preview placement + image fit/aspect clarity on /config#brand-media, audience-mode clarity on
 * /config#session, and a non-intrusive presenter floater (no horizontal overflow, close control, stateful audience
 * button). Deterministic; no Supabase (real upload not exercised). Operator pre-unlocked.
 */

async function unlockOperator(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ppn_operator_unlocked", "1"));
}

// ── Preview active demo is high on the page (before Where-assets / theme preview) ──
test("Preview active demo appears near the top, before lower sections", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Preview active demo", { exact: true })).toBeVisible();
  // DOM order: Preview comes before the lower sections (Where assets appear / Operator theme preview).
  const order = await page.evaluate(() => {
    const ps = Array.from(document.querySelectorAll("p")).map((e) => e.textContent?.trim() ?? "");
    return { preview: ps.indexOf("Preview active demo"), where: ps.indexOf("Where assets appear"), theme: ps.indexOf("Operator theme preview") };
  });
  expect(order.preview).toBeGreaterThanOrEqual(0);
  expect(order.preview).toBeLessThan(order.where);
  expect(order.preview).toBeLessThan(order.theme);
  for (const r of ["/tv/DEMO", "/play/DEMO", "/presentation", "/report", "/kpi"]) {
    await expect(page.locator(`a[href="${r}"]`).first()).toBeVisible();
  }
});

// ── Image slots: fit behaviour + dimension/aspect status ──
test("image slots show fit behaviour and a dimension/aspect status placeholder", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText(/Fit: contain/i).first()).toBeVisible(); // logo / lower-third
  await expect(page.getByText(/Fit: cover/i).first()).toBeVisible();    // hero / sponsor slide / etc.
  await expect(page.getByText(/Dimensions:.*unknown/i).first()).toBeVisible(); // before a file loads
});

// ── Upload-model improvements preserved ──
test("upload-first model is preserved (Current demo assets, Upload by slot, one Apply, advanced fallback)", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#brand-media");
  await expect(page.getByText("Current demo assets", { exact: true })).toBeVisible();
  await expect(page.getByText("Upload by slot", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply uploaded assets to demo" })).toBeVisible();
  await expect(page.getByText(/Advanced fallback: manual path \/ URL/i).first()).toBeVisible();
});

// ── Audience mode clarity on /config#session ──
test("/config#session audience-mode card shows state, what-it-does and predictable enter/exit", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/config#session");
  await expect(page.getByText("Audience mode (presentation)", { exact: true })).toBeVisible();
  await expect(page.getByText(/Currently: presenter/i)).toBeVisible();
  await expect(page.getByText(/hides the presenter helper/i)).toBeVisible();
  // Off by default → predictable Enter control.
  const enter = page.getByRole("button", { name: "Enter audience mode" });
  await expect(enter).toBeVisible();
  await enter.click();
  // Now on → predictable Exit control (does not vanish).
  await expect(page.getByRole("button", { name: "Exit audience mode" }).first()).toBeVisible();
});

// ── Presenter floater: no horizontal overflow, close control, stateful audience button ──
test("presenter floater opens without horizontal page overflow and can be closed", async ({ page }) => {
  await unlockOperator(page);
  await page.goto("/operator");
  await page.getByRole("button", { name: /Presenter tools/ }).click();
  const menu = page.getByTestId("presenter-menu");
  await expect(menu).toBeVisible();
  // Opening the helper must not force the page sideways.
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);
  // Audience button reflects state (off → Enter), and there is a clear close control.
  await expect(menu.getByRole("button", { name: "▶ Enter audience mode" })).toBeVisible();
  await menu.getByRole("button", { name: /Close presenter tools/i }).click();
  await expect(page.getByTestId("presenter-menu")).toHaveCount(0);
});
