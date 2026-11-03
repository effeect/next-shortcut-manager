/*
  Epic Games Fetcher :
  This simply reads the manifest files that the Epic Games Launcher writes for each install.
*/

import fs from "fs/promises";
import path from "path";
import { GameManifest } from "../types/games";

// Need just for this parsing, no need to have it as an export
type EpicGameManifest = {
  DisplayName?: string;
  InstallLocation?: string;
  AppName?: string;
  MainGameAppName?: string;
  CatalogNamespace?: string;
  CatalogItemId?: string;
  bIsIncompleteInstall?: boolean;
};

// Usually C:\ProgramData, but Windows lets that move, so ask the environment
const getManifestDir = () =>
  path.join(
    process.env.PROGRAMDATA || "C:\\ProgramData",
    "Epic",
    "EpicGamesLauncher",
    "Data",
    "Manifests"
  );

// Same format Epic uses for the desktop shortcuts it creates
function launchUrl(manifest: EpicGameManifest & { AppName: string }) {
  const id =
    manifest.CatalogNamespace && manifest.CatalogItemId
      ? [manifest.CatalogNamespace, manifest.CatalogItemId, manifest.AppName]
          .map(encodeURIComponent)
          .join("%3A")
      : encodeURIComponent(manifest.AppName);
  return `com.epicgames.launcher://apps/${id}?action=launch&silent=true`;
}

async function readManifest(fullPath: string): Promise<GameManifest | undefined> {
  try {
    const parsed = JSON.parse(await fs.readFile(fullPath, "utf-8")) as EpicGameManifest;
    const { DisplayName, InstallLocation, AppName } = parsed;
    if (!DisplayName || !InstallLocation || !AppName) return undefined;
    // Still downloading / broken install
    if (parsed.bIsIncompleteInstall) return undefined;
    // DLC gets its own manifest, pointing back at the game it belongs to
    if (parsed.MainGameAppName && parsed.MainGameAppName !== AppName) {
      return undefined;
    }

    return {
      name: DisplayName,
      appid: AppName,
      path: InstallLocation,
      platform: "epic", // Hardcoded since we know the source
      launch: { type: "url", url: launchUrl({ ...parsed, AppName }) },
    };
  } catch (err) {
    console.warn(`Failed to parse Epic manifest ${fullPath}:`, err);
    return undefined;
  }
}

export async function getEpicInstalledGames(): Promise<GameManifest[]> {
  const manifestDir = getManifestDir();

  let files: string[];
  try {
    files = (await fs.readdir(manifestDir)).filter((f) => f.endsWith(".item"));
  } catch {
    console.warn(`Epic manifest directory not found: ${manifestDir}`);
    return [];
  }

  const games = await Promise.all(
    files.map((file) => readManifest(path.join(manifestDir, file)))
  );
  return games.filter((game): game is GameManifest => game !== undefined);
}
