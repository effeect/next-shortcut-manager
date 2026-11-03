import { IpcMainInvokeEvent } from "electron";
import { scanAllLaunchers, ScanResult } from "../lib/launchers";
import { getCustomSavedGames } from "../lib/custom/saveCustomGames";
import { runLaunchTarget } from "../lib/os/runLaunchTarget";
import { GameManifest, isPlatform } from "../lib/types/games";
import type { ActionResult, LibraryResult } from "../types/api";

// Scanning spawns reg.exe and reads every manifest, so it's done once and reused.
// Storing the promise also means two requests at the same time share one scan.
let launcherScan: Promise<ScanResult> | undefined;

const scanLaunchers = (refresh: boolean) => {
  if (!launcherScan || refresh) launcherScan = scanAllLaunchers();
  return launcherScan;
};

// Start scanning while the window is still loading
export const warmLibraryCache = () => void scanLaunchers(false);

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

async function getLibrary(refresh = false): Promise<LibraryResult> {
  const { games, errors } = await scanLaunchers(refresh);
  // Custom games come straight from the store, so they're always up to date
  const all = [...games, ...getCustomSavedGames()];

  // The same game can be listed twice (e.g. a Steam library added twice),
  // and the UI keys cards on platform + appid
  const seen = new Set<string>();
  const unique = all.filter((game) => {
    const key = `${game.platform}:${game.appid}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    games: unique.sort((a, b) => collator.compare(a.name, b.name)),
    errors,
  };
}

export const handleGetLibrary = (event: IpcMainInvokeEvent, options: unknown) =>
  getLibrary((options as { refresh?: unknown } | undefined)?.refresh === true);

export async function handleLaunchGame(
  event: IpcMainInvokeEvent,
  platform: unknown,
  appid: unknown
): Promise<ActionResult> {
  if (!isPlatform(platform) || typeof appid !== "string") {
    return { ok: false, error: "Invalid game." };
  }

  // Look the game up on this side rather than trusting a path/URL from the renderer
  const { games } = await getLibrary();
  const game: GameManifest | undefined = games.find(
    (g) => g.platform === platform && g.appid === appid
  );
  if (!game) {
    return { ok: false, error: "That game isn't in your library any more. Try refreshing." };
  }

  try {
    await runLaunchTarget(game.launch);
    return { ok: true };
  } catch (error) {
    console.error(`Failed to launch ${game.name}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Couldn't launch ${game.name}: ${message}` };
  }
}
