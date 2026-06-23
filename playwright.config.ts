import { defineConfig, devices } from "@playwright/test";

/**
 * PPN smoke harness (POC). Route accessibility + operator gate + buyer-nav-leak + operator control centre.
 * Reuses a running dev server on :5173 (reuseExistingServer). Browser binaries are NOT committed
 * (run `npx playwright install chromium` once). Reports/artifacts are git-ignored.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PPN_BASE_URL ?? "http://localhost:5173",
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: process.env.PPN_BASE_URL ?? "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
