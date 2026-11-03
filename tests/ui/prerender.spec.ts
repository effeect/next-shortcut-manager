import { test, expect } from "@playwright/test";

// Checks the HTML the build produces *before* any JavaScript runs, so a change that
// accidentally turns a page back into a client-only render gets caught.
test.describe("Pre-rendered HTML", () => {
  test.use({ javaScriptEnabled: false });

  test("library shell and loading skeleton are in the HTML", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Library", level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search your library" })).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toBeVisible();
  });

  test("the add game form is in the HTML", async ({ page }) => {
    await page.goto("/add-game");
    await expect(page.getByRole("heading", { name: "Add a game" })).toBeVisible();
    await expect(page.getByLabel("Game file")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to library" })).toBeVisible();
  });

  test("settings is fully rendered", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Supported launchers" })).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(5);
  });
});
