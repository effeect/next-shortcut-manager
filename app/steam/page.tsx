"use client";

import { useEffect, useState } from "react";

// Steam Type details, will fill more in later
type Game = {
  appid: string;
  name: string;
  installdir: string;
  path: string;
};

declare global {
  interface Window {
    electronAPI?: {
      getInstalledSteamGames: () => Promise<Game[]>;
    };
  }
}

export default function InstalledGamesPage() {
  // State for the games list
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.electronAPI?.getInstalledSteamGames
    ) {
      window.electronAPI.getInstalledSteamGames().then(setGames);
    } else {
      console.warn("Electron API not available");
    }
  }, []);

  console.log(games);
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {games?.map((game) => (
          <div key={game.appid} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{game.name}</h2>
            <p className="text-sm text-gray-600">{game.path}</p>
            <button
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
              onClick={() => window.open(`steam://run/${game.appid}`)}
            >
              Launch
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
