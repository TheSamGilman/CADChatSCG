import { defineConfig, devices } from "@playwright/test";

// BASE_URL points the tests at an already-running deploy; otherwise they start the app themselves
// (or reuse `npm run dev` if it's already running).
const baseURL = process.env.BASE_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        cwd: "../..",
        url: baseURL,
        reuseExistingServer: true,
        gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
      },
});
