import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = !!process.env.CI;

// Two projects:
//  - ui:       the static export in Chromium, with a mocked window.electronAPI (runs anywhere)
//  - electron: smoke test of the real Electron app (best on Windows, where the launchers live)
// Both test the build output, so run `npm run renderer:build` (and `electron:build` for electron) first.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "ui",
      testDir: "./tests/ui",
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORT}` },
    },
    {
      name: "electron",
      testDir: "./tests/electron",
      // One app instance shared by the file's tests
      fullyParallel: false,
    },
  ],
  webServer: {
    command: `node tests/serve-static.mjs ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
  },
});
