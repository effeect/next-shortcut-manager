import { test, expect, _electron as electron, type ElectronApplication, type Page } from "@playwright/test";
import path from "node:path";

// Smoke test of the real app: compiled main process, preload bridge, electron-serve and
// a real launcher scan. Needs `npm run renderer:build && npm run electron:build` first.
let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(__dirname, "../../dist/electron/electron/main.js")],
    // Anything but "development", so it loads the static export instead of localhost:3000
    env: { ...process.env, NODE_ENV: "production" },
  });
  page = await app.firstWindow();
});

test.afterAll(async () => {
  await app?.close();
});

test("opens the library from the static export", async () => {
  await expect(page).toHaveTitle("Next Shortcut Manager");
  expect(page.url()).toMatch(/^app:\/\//);
  await expect(page.getByRole("heading", { name: "Library", level: 1 })).toBeVisible();
});

test("the preload exposes the API", async () => {
  const methods = await page.evaluate(() => Object.keys(window.electronAPI ?? {}).sort());
  expect(methods).toEqual([
    "getLibrary",
    "launchGame",
    "openExternal",
    "openFileLocation",
    "removeCustomGame",
    "saveCustomGame",
    "selectGamePath",
    "updateCustomGame",
  ]);
});

test("the launcher scan finishes", async () => {
  // Whatever is installed on the machine, the skeleton is replaced by games or the empty state
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
  await expect(
    page.locator("article").first().or(page.getByRole("heading", { name: "No games found" }))
  ).toBeVisible();
});

test("navigates between pages", async () => {
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("link", { name: "Add game" }).click();
  await expect(page.getByRole("heading", { name: "Add a game" })).toBeVisible();
  await nav.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Supported launchers" })).toBeVisible();
});
