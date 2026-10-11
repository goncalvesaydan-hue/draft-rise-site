import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";
const publicMode = process.env.PORTAL_E2E_PUBLIC === "1";
const port = publicMode ? 3201 : 3200;
export default defineConfig({
  testMatch: publicMode ? "**/public.spec.ts" : "**/portal.spec.ts",
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: publicMode
      ? "npm run start -- --hostname 127.0.0.1 --port 3201"
      : "npm run dev:portal -- --port 3200",
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      PORTAL_DB_PATH: resolve(`.data/e2e-${Date.now()}.sqlite`),
      NEXT_TELEMETRY_DISABLED: "1",
      PORTAL_LOCAL_MODE: publicMode ? "0" : "1",
      PORTAL_REMOTE_ENABLED: "0",
      PORTAL_AUTH_EMAILS_ENABLED: "0",
      PORTAL_APP_URL: `http://127.0.0.1:${port}`,
    },
  },
});
