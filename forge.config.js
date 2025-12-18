// forge.config.js
module.exports = {
  packagerConfig: {
    name: "NextShortcutManager",
    executableName: "next-shortcut-manager",
    icon: "./app/favicon.ico",
    ignore: [
      /^\/app/,
      /^\/src/, // Source files
      /^\/renderer/, // Raw Next.js files
      /^\/electron/, // Raw TS Electron files
      /^\/lib/, // Raw TS Library files
      /^\/tsconfig\.json/, // TS Configs
      /^\/next\.config/, // Next Config
      /^\/\.next/, // Next.js build cache (huge!)
      /^\/\.git/, // Git history
      /^\/out/, // Forge's own output folder
      /^\/README\.md/, // Documentation
      // Ignore other source files to keep the bundle small
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "NextShortcutManager",
        authors: "Oliver Dimes",
        version: "1.0.0",
        description: "Next Shortcut Manager Application",
        setupExe: "NextShortcutManagerSetup.exe",
        setupIcon: "./app/favicon.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
  ],
};
