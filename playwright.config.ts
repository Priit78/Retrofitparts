import { defineConfig } from "@playwright/test";

// Runs against the production build: `npm run build` first. Port 3210 keeps clear of other
// local servers; an already running server on it is reused, so make sure it serves this build.
const port = 3210;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${port}`,
    launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
  },
  webServer: {
    command: `npm run start -- -p ${port}`,
    url: `http://localhost:${port}/et`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
