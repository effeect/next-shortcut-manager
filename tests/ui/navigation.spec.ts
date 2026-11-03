import { test, expect } from "./fixtures";

test.describe("Navigation", () => {
  test("sidebar links navigate and highlight the current page", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });

    await expect(nav.getByRole("link", { name: "Library" })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("link", { name: "Add game" }).click();
    await expect(page.getByRole("heading", { name: "Add a game" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Add game" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Library" })).not.toHaveAttribute("aria-current");

    await nav.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Settings", level: 1 })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
  });

  test("settings lists every supported launcher", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("listitem")).toHaveText(["Steam", "Epic", "EA", "Ubisoft", "GOG"]);
  });

  test("the sidebar collapses to icons in a narrow window", async ({ page, mockApi }) => {
    await mockApi();
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });

    // Labels are hidden but the links keep their accessible names (via title)
    await expect(nav.getByText("Add game", { exact: true })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Add game" })).toBeVisible();
  });
});
