import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3002",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start -- -p 3002",
    url: "http://127.0.0.1:3002",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
