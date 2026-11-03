// The contract between the preload script and the renderer (window.electronAPI).
// preload.ts implements this type, and the UI uses it, so the two can't drift apart.
import type { GameManifest, Platform } from "../lib/types/games";
import type { ScanError } from "../lib/launchers";

export type { ScanError };

export type LibraryResult = {
  games: GameManifest[];
  // Launchers that couldn't be read this time, so the UI can say so
  errors: ScanError[];
};

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CustomGameInput = { name: string; path: string };

export type SaveCustomGameResult =
  | { ok: true; game: GameManifest }
  | { ok: false; error: string };

export interface ElectronAPI {
  // Cached after the first scan, pass { refresh: true } to rescan the launchers
  getLibrary: (options?: { refresh?: boolean }) => Promise<LibraryResult>;
  launchGame: (platform: Platform, appid: string) => Promise<ActionResult>;
  openFileLocation: (path: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<boolean>;
  selectGamePath: () => Promise<string | undefined>;
  saveCustomGame: (game: CustomGameInput) => Promise<SaveCustomGameResult>;
  updateCustomGame: (
    appid: string,
    game: CustomGameInput
  ) => Promise<SaveCustomGameResult>;
  removeCustomGame: (appid: string) => Promise<ActionResult>;
}

declare global {
  interface Window {
    // Missing when the UI is opened in a normal browser instead of the app
    electronAPI?: ElectronAPI;
  }
}
