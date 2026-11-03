import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import Store from "electron-store";
import { GameManifest, LaunchTarget } from "../types/games";
import type {
  ActionResult,
  CustomGameInput,
  SaveCustomGameResult,
} from "../../types/api";

// What's saved in config.json. Older entries also have platform: "custom".
type StoredCustomGame = { appid: string; name: string; path: string };

interface StoreSchema {
  customGames: StoredCustomGame[];
}

const customGameStore: Store<StoreSchema> = new Store<StoreSchema>({
  defaults: {
    customGames: [],
  },
});

// File types the picker allows. Checked again here because the renderer isn't trusted.
export const CUSTOM_GAME_EXTENSIONS = ["exe", "lnk", "url", "bat", "cmd", "app"];

// .exe files run from their own folder (plenty of games need that).
// Everything else (shortcuts, scripts, .app bundles) is opened by the OS.
const launchTargetFor = (file: string): LaunchTarget =>
  path.extname(file).toLowerCase() === ".exe"
    ? { type: "exe", path: file, args: [], cwd: path.dirname(file) }
    : { type: "open", path: file };

const toManifest = (game: StoredCustomGame): GameManifest => ({
  appid: game.appid,
  name: game.name,
  path: game.path,
  platform: "custom",
  launch: launchTargetFor(game.path),
});

const readStore = (): StoredCustomGame[] =>
  customGameStore.get("customGames") ?? [];

const samePath = (a: string, b: string) => {
  const [x, y] = [path.normalize(a), path.normalize(b)];
  return process.platform === "win32" ? x.toLowerCase() === y.toLowerCase() : x === y;
};

export const getCustomSavedGames = (): GameManifest[] => readStore().map(toManifest);

type ValidatedInput = { ok: true; name: string; path: string } | { ok: false; error: string };

async function validate(input: unknown): Promise<ValidatedInput> {
  const { name, path: file } = (input ?? {}) as Partial<Record<keyof CustomGameInput, unknown>>;
  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "Please enter a name." };
  }
  if (name.trim().length > 200) {
    return { ok: false, error: "That name is too long." };
  }
  if (typeof file !== "string" || !path.isAbsolute(file)) {
    return { ok: false, error: "Please select the game's file." };
  }
  const extension = path.extname(file).slice(1).toLowerCase();
  if (!CUSTOM_GAME_EXTENSIONS.includes(extension)) {
    return { ok: false, error: `.${extension} files can't be added as games.` };
  }
  try {
    await fs.stat(file);
  } catch {
    return { ok: false, error: `Couldn't find ${file}.` };
  }
  return { ok: true, name: name.trim(), path: path.normalize(file) };
}

export async function addCustomGame(input: unknown): Promise<SaveCustomGameResult> {
  const valid = await validate(input);
  if (!valid.ok) return valid;

  const games = readStore();
  const duplicate = games.find((g) => samePath(g.path, valid.path));
  if (duplicate) {
    return { ok: false, error: `"${duplicate.name}" is already using that file.` };
  }

  const game: StoredCustomGame = {
    appid: `custom-${randomUUID()}`,
    name: valid.name,
    path: valid.path,
  };
  customGameStore.set("customGames", [...games, game]);
  return { ok: true, game: toManifest(game) };
}

export async function updateCustomGame(
  appid: unknown,
  input: unknown
): Promise<SaveCustomGameResult> {
  const games = readStore();
  const existing = games.find((g) => g.appid === appid);
  if (!existing) return { ok: false, error: "That game isn't in your library any more." };

  const valid = await validate(input);
  if (!valid.ok) return valid;

  const duplicate = games.find((g) => g.appid !== appid && samePath(g.path, valid.path));
  if (duplicate) {
    return { ok: false, error: `"${duplicate.name}" is already using that file.` };
  }

  const updated: StoredCustomGame = { appid: existing.appid, name: valid.name, path: valid.path };
  customGameStore.set(
    "customGames",
    games.map((g) => (g.appid === existing.appid ? updated : g))
  );
  return { ok: true, game: toManifest(updated) };
}

export function removeCustomGame(appid: unknown): ActionResult {
  const games = readStore();
  const remaining = games.filter((g) => g.appid !== appid);
  if (remaining.length === games.length) {
    return { ok: false, error: "That game isn't in your library any more." };
  }
  customGameStore.set("customGames", remaining);
  return { ok: true };
}
