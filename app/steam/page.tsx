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
      window.electronAPI.getInstalledSteamGames().then((data) => {
        setGames(data);
      });
    } else {
      console.warn("Electron API not available");
    }
  }, []);
  return (
    <>
      <div className="columns is-multiline">
        {games?.map((game) => (
          <div key={game.appid} className="column is-half">
            <div className="box">
              <p className="title is-4">{game.name}</p>
              <p className="subtitle is-6 has-text-grey">{game.path}</p>
              <div className="mt-3">
                <button
                  className="button is-link"
                  onClick={() => window.open(`steam://run/${game.appid}`)}
                >
                  Launch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
