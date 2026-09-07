import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:4173/", trace: "retain-on-failure" },
  webServer: {
    command: "yarn vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/",
    reuseExistingServer: true,
  },
  projects: [
    { name: "phone", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
