import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    launchOptions: { executablePath: "/opt/pw-browsers/chromium" },
  },
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://localhost:3100/et",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
