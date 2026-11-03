// Launchers we can scan for installed games.
// Adding one here makes TypeScript point at every place that still needs handling
// (the launcher registry in lib/launchers.ts, PLATFORM_LABELS below, and the icons in the UI).
export const LAUNCHERS = ["steam", "epic", "ea", "ubi", "gog"] as const;
export type LauncherId = (typeof LAUNCHERS)[number];

// Everything that can appear in the library: launcher games plus games the user added themselves.
export const PLATFORMS = [...LAUNCHERS, "custom"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  steam: "Steam",
  epic: "Epic",
  ea: "EA",
  ubi: "Ubisoft",
  gog: "GOG",
  custom: "Custom",
};

export const isPlatform = (value: unknown): value is Platform =>
  typeof value === "string" && (PLATFORMS as readonly string[]).includes(value);

// How to start a game. Worked out when the game is scanned, so launching
// never has to trust a path or URL sent over from the renderer.
export type LaunchTarget =
  // A launcher protocol, e.g. steam://run/413150
  | { type: "url"; url: string }
  // Run an executable directly, from its own folder
  | { type: "exe"; path: string; args: string[]; cwd: string }
  // Let the OS open it (.lnk / .url shortcuts, .bat files, .app bundles)
  | { type: "open"; path: string };

export type GameManifest = {
  name: string;
  appid: string;
  path: string;
  platform: Platform; // Platform in this context is the launcher
  launch: LaunchTarget;
};
