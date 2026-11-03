import { test, expect, gameCards } from "./fixtures";

test.describe("Add game", () => {
  test("Browse fills the path and a name from the file", async ({ page, mockApi }) => {
    await mockApi({ selectedPath: "C:\\Games\\Hollow Knight\\hollow_knight.exe" });
    await page.goto("/add-game");

    await page.getByRole("button", { name: "Browse" }).click();
    await expect(page.getByLabel("Game file")).toHaveValue("C:\\Games\\Hollow Knight\\hollow_knight.exe");
    await expect(page.getByLabel("Name")).toHaveValue("hollow_knight");
  });

  test("Browse keeps a name the user already typed", async ({ page, mockApi }) => {
    await mockApi({ selectedPath: "C:\\Games\\hk.exe" });
    await page.goto("/add-game");

    await page.getByLabel("Name").fill("Hollow Knight");
    await page.getByRole("button", { name: "Browse" }).click();
    await expect(page.getByLabel("Name")).toHaveValue("Hollow Knight");
  });

  test("saving without a file shows an error", async ({ page, mockApi, apiCalls }) => {
    await mockApi();
    await page.goto("/add-game");

    await page.getByLabel("Name").fill("Something");
    await page.getByRole("button", { name: "Add to library" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("choose the game's file");
    expect((await apiCalls()).some((c) => c.method === "saveCustomGame")).toBe(false);
  });

  test("a saved game is confirmed and shows up in the library", async ({ page, mockApi, apiCalls }) => {
    await mockApi({ selectedPath: "C:\\Games\\hk.exe" });
    await page.goto("/add-game");

    await page.getByRole("button", { name: "Browse" }).click();
    await page.getByLabel("Name").fill("Hollow Knight");
    await page.getByRole("button", { name: "Add to library" }).click();

    await expect(page.getByRole("status")).toContainText("Added Hollow Knight to your library.");
    // The form clears for the next one
    await expect(page.getByLabel("Name")).toHaveValue("");
    expect((await apiCalls()).find((c) => c.method === "saveCustomGame")?.args).toEqual([
      { name: "Hollow Knight", path: "C:\\Games\\hk.exe" },
    ]);

    // Client-side navigation keeps the mock's state, so the new game is listed
    await page.getByRole("navigation").getByRole("link", { name: "Library" }).click();
    await expect(gameCards(page).filter({ hasText: "Hollow Knight" })).toHaveCount(1);
  });

  test("edit mode loads the game and saves changes", async ({ page, mockApi, apiCalls }) => {
    await mockApi();
    await page.goto("/");
    await gameCards(page).filter({ hasText: "Minecraft" }).getByRole("link", { name: "Edit" }).click();

    await expect(page.getByRole("heading", { name: "Edit game" })).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("Minecraft");
    await expect(page.getByLabel("Game file")).toHaveValue("C:\\Games\\Minecraft\\Minecraft.exe");

    await page.getByLabel("Name").fill("Minecraft Java");
    await page.getByRole("button", { name: "Save changes" }).click();

    // Goes back to the library with the new name
    await expect(page).toHaveURL(/\/$/);
    await expect(gameCards(page).filter({ hasText: "Minecraft Java" })).toHaveCount(1);
    expect((await apiCalls()).find((c) => c.method === "updateCustomGame")?.args).toEqual([
      "custom-1",
      { name: "Minecraft Java", path: "C:\\Games\\Minecraft\\Minecraft.exe" },
    ]);
  });

  test("editing an unknown game says so", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/add-game?edit=nope");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Couldn't find that game.");
  });

  test("Cancel goes back to the library", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/add-game");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
