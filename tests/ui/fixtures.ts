import { test as base, expect, type Page } from "@playwright/test";
import type { GameManifest } from "@/electron/lib/types/games";
import type { ScanError } from "@/electron/types/api";

// A small library covering a few launchers plus a custom game
export const GAMES: GameManifest[] = [
  {
    name: "Portal 2",
    appid: "620",
    path: "C:\\Steam\\steamapps\\common\\Portal 2",
    platform: "steam",
    launch: { type: "url", url: "steam://rungameid/620" },
  },
  {
    name: "Celeste",
    appid: "504230",
    path: "C:\\Steam\\steamapps\\common\\Celeste",
    platform: "steam",
    launch: { type: "url", url: "steam://rungameid/504230" },
  },
  {
    name: "Alan Wake 2",
    appid: "dauntless",
    path: "D:\\Epic\\AlanWake2",
    platform: "epic",
    launch: { type: "url", url: "com.epicgames.launcher://apps/x?action=launch" },
  },
  {
    name: "Minecraft",
    appid: "custom-1",
    path: "C:\\Games\\Minecraft\\Minecraft.exe",
    platform: "custom",
    launch: { type: "exe", path: "C:\\Games\\Minecraft\\Minecraft.exe", args: [], cwd: "C:\\Games\\Minecraft" },
  },
];

export type MockOptions = {
  games?: GameManifest[];
  errors?: ScanError[];
  // Make launchGame fail with this message
  launchError?: string;
  // What the "Browse" file picker returns
  selectedPath?: string;
};

export type ApiCall = { method: string; args: unknown[] };

// Runs in the browser before the app loads. Must be self-contained (it's serialised).
function installMockApi(options: Required<MockOptions>) {
  const calls: ApiCall[] = [];
  const library = { games: [...options.games], errors: [...options.errors] };
  const record = (method: string, args: unknown[]) => calls.push({ method, args });
  let nextId = 100;

  (window as unknown as { __apiCalls: ApiCall[] }).__apiCalls = calls;
  window.electronAPI = {
    getLibrary: async (...args) => {
      record("getLibrary", args);
      return structuredClone(library);
    },
    launchGame: async (...args) => {
      record("launchGame", args);
      return options.launchError ? { ok: false, error: options.launchError } : { ok: true };
    },
    openFileLocation: async (...args) => (record("openFileLocation", args), true),
    openExternal: async (...args) => (record("openExternal", args), true),
    selectGamePath: async (...args) => {
      record("selectGamePath", args);
      return options.selectedPath || undefined;
    },
    saveCustomGame: async (...args) => {
      record("saveCustomGame", args);
      const [input] = args;
      const game = {
        ...input,
        appid: `custom-${nextId++}`,
        platform: "custom" as const,
        launch: { type: "open" as const, path: input.path },
      };
      library.games.push(game);
      return { ok: true, game };
    },
    updateCustomGame: async (...args) => {
      record("updateCustomGame", args);
      const [appid, input] = args;
      const game = library.games.find((g) => g.appid === appid);
      if (!game) return { ok: false, error: "Not found" };
      Object.assign(game, input);
      return { ok: true, game };
    },
    removeCustomGame: async (...args) => {
      record("removeCustomGame", args);
      library.games = library.games.filter((g) => g.appid !== args[0]);
      return { ok: true };
    },
  };
}

type Fixtures = {
  // Call before page.goto to pretend the page is running inside Electron
  mockApi: (options?: MockOptions) => Promise<void>;
  // Every electronAPI call the page made, in order
  apiCalls: () => Promise<ApiCall[]>;
};

export const test = base.extend<Fixtures>({
  mockApi: async ({ page }, provide) => {
    await provide(async (options = {}) => {
      await page.addInitScript(installMockApi, {
        games: options.games ?? GAMES,
        errors: options.errors ?? [],
        launchError: options.launchError ?? "",
        selectedPath: options.selectedPath ?? "",
      });
    });
  },
  apiCalls: async ({ page }, provide) => {
    await provide(() =>
      page.evaluate(() => (window as unknown as { __apiCalls: ApiCall[] }).__apiCalls ?? [])
    );
  },
});

export const gameCards = (page: Page) => page.locator("article");

export { expect };
