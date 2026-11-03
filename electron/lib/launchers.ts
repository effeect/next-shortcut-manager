// One place that lists every launcher we can scan.
// Nothing in here depends on Electron, so it can be reused outside the app.
import { GameManifest, LAUNCHERS, LauncherId } from "./types/games";
import { findSteamPath, getSteamLibraryFolders } from "./steam/readLibraryFolders";
import { getInstalledSteamGames } from "./steam/readInstalledApps";
import { getEpicInstalledGames } from "./epic/readInstalledApps";
import { getInstalledEAGames } from "./ea/readInstalledApps";
import { getInstalledUbiGames } from "./ubisoft/readInstalledApps";
import { getInstalledGOGGames } from "./gog/readInstalledApps";

export type Launcher = {
  scan: () => Promise<GameManifest[]>;
};

async function scanSteam(): Promise<GameManifest[]> {
  const steamPath = await findSteamPath();
  if (!steamPath) return [];
  return getInstalledSteamGames(await getSteamLibraryFolders(steamPath));
}

// Record<LauncherId, ...> means TypeScript errors here if a launcher is added to LAUNCHERS
// without a scanner.
export const launchers: Record<LauncherId, Launcher> = {
  steam: { scan: scanSteam },
  epic: { scan: getEpicInstalledGames },
  ea: { scan: getInstalledEAGames },
  ubi: { scan: getInstalledUbiGames },
  gog: { scan: getInstalledGOGGames },
};

export type ScanError = { launcher: LauncherId; message: string };
export type ScanResult = { games: GameManifest[]; errors: ScanError[] };

// Scans every launcher in parallel. A launcher that fails is reported in `errors`
// instead of throwing away every other launcher's games.
export async function scanAllLaunchers(): Promise<ScanResult> {
  const results = await Promise.allSettled(
    LAUNCHERS.map((id) => launchers[id].scan())
  );

  const games: GameManifest[] = [];
  const errors: ScanError[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      games.push(...result.value);
    } else {
      const message =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      console.error(`Scanning ${LAUNCHERS[i]} failed:`, result.reason);
      errors.push({ launcher: LAUNCHERS[i], message });
    }
  });

  return { games, errors };
}
