import fs from "fs/promises";
import path from "path";
import vdf from "vdf-parser"; // Need the VDF parser to read the steam files
import { readRegistryValue } from "../misc/regQuery";

/*
    Notes :
    - Steam can be installed anywhere, so we ask the registry where it is
    - STEAM_PATH (a real environment variable) can still be used to override it
*/

const DEFAULT_STEAM_PATH = "C:\\Program Files (x86)\\Steam";

// types: false keeps every value a string. Otherwise vdf-parser turns "413150" into a number,
// and a game called "2048" would get a numeric name.
export const VDF_OPTIONS = { types: false, arrayify: false };

type LibraryFoldersVdf = {
  libraryfolders?: Record<string, { path?: string } | string>;
};

const exists = (p: string) =>
  fs.access(p).then(
    () => true,
    () => false
  );

// Windows paths are case-insensitive, and the registry gives "c:/program files (x86)/steam"
// while libraryfolders.vdf has "C:\\Program Files (x86)\\Steam" for the same folder.
const pathKey = (p: string) => {
  const normalized = path.normalize(p).replace(/[\\/]+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
};

// Finds the Steam install folder: STEAM_PATH, then the registry, then the default location.
export async function findSteamPath(): Promise<string | undefined> {
  const sources: Array<() => Promise<string | undefined> | string | undefined> =
    [
      () => process.env.STEAM_PATH,
      () =>
        readRegistryValue("HKEY_CURRENT_USER\\Software\\Valve\\Steam", "SteamPath"),
      () =>
        readRegistryValue(
          "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam",
          "InstallPath"
        ),
      () => DEFAULT_STEAM_PATH,
    ];

  for (const source of sources) {
    try {
      const candidate = await source();
      if (candidate && (await exists(candidate))) return path.normalize(candidate);
    } catch (err) {
      console.warn("Couldn't check a Steam location:", err);
    }
  }
  return undefined;
}

// Returns every Steam library folder. The Steam folder itself is always one,
// even if libraryfolders.vdf is missing or unreadable.
export async function getSteamLibraryFolders(steamPath: string): Promise<string[]> {
  const folders: string[] = [];
  const vdfPath = path.join(steamPath, "steamapps", "libraryfolders.vdf");

  try {
    const vdfFile = vdf.parse<LibraryFoldersVdf>(
      await fs.readFile(vdfPath, "utf-8"),
      VDF_OPTIONS
    );
    for (const entry of Object.values(vdfFile.libraryfolders ?? {})) {
      // Current format is { path: "..." }, older Steam versions stored the path directly
      const folder = typeof entry === "string" ? entry : entry?.path;
      if (folder) folders.push(folder);
    }
  } catch (err) {
    console.warn(`Couldn't read ${vdfPath}:`, err);
  }
  // Added last so the nicer casing from libraryfolders.vdf wins the de-dupe below
  folders.push(steamPath);

  const seen = new Set<string>();
  return folders.filter((folder) => {
    const key = pathKey(folder);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
