"use client";

import { useEffect, useState } from "react";

type EpicGameManifest = {
  DisplayName: string;
  InstallLocation: string;
  LaunchExecutable: string;
  AppName: string;
  CatalogNamespace: string;
  CatalogItemId: string;
};

declare global {
  interface Window {
    electronAPI?: {
      getInstalledEpicGames: () => Promise<EpicGameManifest[]>;
    };
  }
}

export default function InstalledGamesPage() {
  // State for the games list
  const [games, setGames] = useState<EpicGameManifest[]>([]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.electronAPI?.getInstalledEpicGames
    ) {
      window.electronAPI.getInstalledEpicGames().then((data) => {
        setGames(data);
      });
    } else {
      console.warn("Electron API not available");
    }
  }, []);
  return (
    <>
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Installed Epic Games</h1>
        {games.length === 0 ? (
          <p className="text-gray-500">
            No Epic games found or not running inside Electron.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <div key={game.AppName} className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold">{game.DisplayName}</h2>
                <p className="text-sm text-gray-600">{game.InstallLocation}</p>
                <button
                  className="mt-2 px-4 py-1 bg-purple-600 text-white rounded"
                  onClick={() =>
                    window.open(
                      `"${game.InstallLocation}\\${game.LaunchExecutable}"`,
                      "_blank"
                    )
                  }
                >
                  Launch
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
