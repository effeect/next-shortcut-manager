import { test, expect, gameCards, GAMES } from "./fixtures";

test.describe("Library", () => {
  test("lists every game, sorted by name", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/");

    await expect(gameCards(page)).toHaveCount(GAMES.length);
    await expect(gameCards(page).locator("h2")).toHaveText([
      "Alan Wake 2",
      "Celeste",
      "Minecraft",
      "Portal 2",
    ]);
  });

  test("filter chips show counts and filter by launcher", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/");
    const filters = page.getByRole("group", { name: "Filter by launcher" });

    await expect(filters.getByRole("button", { name: /^All/ })).toContainText("4");
    await expect(filters.getByRole("button", { name: /Steam/ })).toContainText("2");
    // Launchers without games get no chip
    await expect(filters.getByRole("button", { name: /GOG/ })).toHaveCount(0);

    await filters.getByRole("button", { name: /Steam/ }).click();
    await expect(filters.getByRole("button", { name: /Steam/ })).toHaveAttribute("aria-pressed", "true");
    await expect(gameCards(page).locator("h2")).toHaveText(["Celeste", "Portal 2"]);
  });

  test("search narrows the list and can be cleared", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/");
    const search = page.getByRole("searchbox", { name: "Search your library" });

    await search.fill("port");
    await expect(gameCards(page).locator("h2")).toHaveText(["Portal 2"]);

    await search.fill("does not exist");
    await expect(page.getByRole("heading", { name: "No matches" })).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(search).toHaveValue("");
    await expect(gameCards(page)).toHaveCount(GAMES.length);
  });

  test("Play launches the game through the API", async ({ page, mockApi, apiCalls }) => {
    await mockApi();
    await page.goto("/");

    await gameCards(page).filter({ hasText: "Portal 2" }).getByRole("button", { name: "Play" }).click();
    await expect
      .poll(async () => (await apiCalls()).filter((c) => c.method === "launchGame"))
      .toEqual([{ method: "launchGame", args: ["steam", "620"] }]);
  });

  test("a failed launch shows the error on the card", async ({ page, mockApi }) => {
    await mockApi({ launchError: "Steam isn't installed" });
    await page.goto("/");

    const card = gameCards(page).filter({ hasText: "Celeste" });
    await card.getByRole("button", { name: "Play" }).click();
    await expect(card.getByRole("alert")).toHaveText("Steam isn't installed");
  });

  test("folder and search buttons call the API", async ({ page, mockApi, apiCalls }) => {
    await mockApi();
    await page.goto("/");
    const card = gameCards(page).filter({ hasText: "Celeste" });

    await card.getByRole("button", { name: "Open install folder" }).click();
    await card.getByRole("button", { name: "Search online" }).click();

    await expect
      .poll(async () => (await apiCalls()).filter((c) => c.method !== "getLibrary"))
      .toEqual([
        { method: "openFileLocation", args: [GAMES[1].path] },
        { method: "openExternal", args: ["https://www.google.com/search?q=Celeste"] },
      ]);
  });

  test("only custom games can be edited or removed", async ({ page, mockApi }) => {
    await mockApi();
    await page.goto("/");

    await expect(
      gameCards(page).filter({ hasText: "Portal 2" }).getByRole("button", { name: "Remove from library" })
    ).toHaveCount(0);
    const custom = gameCards(page).filter({ hasText: "Minecraft" });
    await expect(custom.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      /\/add-game\?edit=custom-1$/
    );
  });

  test("removing a custom game asks first, then drops the card", async ({ page, mockApi, apiCalls }) => {
    await mockApi();
    await page.goto("/");
    const card = gameCards(page).filter({ hasText: "Minecraft" });

    // Cancelling the confirm leaves it alone
    page.once("dialog", (dialog) => dialog.dismiss());
    await card.getByRole("button", { name: "Remove from library" }).click();
    await expect(card).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await card.getByRole("button", { name: "Remove from library" }).click();
    await expect(card).toHaveCount(0);
    expect((await apiCalls()).filter((c) => c.method === "removeCustomGame")).toEqual([
      { method: "removeCustomGame", args: ["custom-1"] },
    ]);
  });

  test("Rescan asks the main process for a fresh scan", async ({ page, mockApi, apiCalls }) => {
    await mockApi();
    await page.goto("/");
    await expect(gameCards(page)).toHaveCount(GAMES.length);

    await page.getByRole("button", { name: /Rescan/ }).click();
    await expect
      .poll(async () => (await apiCalls()).filter((c) => c.method === "getLibrary").map((c) => c.args))
      .toEqual([[], [{ refresh: true }]]);
  });

  test("launchers that failed to scan show a dismissable warning", async ({ page, mockApi }) => {
    await mockApi({ errors: [{ launcher: "epic", message: "Manifest folder missing" }] });
    await page.goto("/");

    const warning = page.getByRole("alert").filter({ hasText: "Epic" });
    await expect(warning).toContainText("Couldn't read your Epic games: Manifest folder missing");
    await warning.getByRole("button", { name: "Dismiss" }).click();
    await expect(warning).toHaveCount(0);
  });

  test("an empty library points to Add game", async ({ page, mockApi }) => {
    await mockApi({ games: [] });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "No games found" })).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Add a game" }).click();
    await expect(page).toHaveURL(/\/add-game$/);
  });

  test("outside Electron it explains how to run the app", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toContainText("only loads inside the app");
    await expect(gameCards(page)).toHaveCount(0);
  });
});
