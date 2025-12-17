"use client";

import { useEffect, useState } from "react";
import Gamebox from "../components/atoms/Gamebox/Gamebox";
type EpicGameManifest = {
  DisplayName: string;
  InstallLocation: string;
  LaunchExecutable: string;
  AppName: string;
  CatalogNamespace: string;
  CatalogItemId: string;
};

type Game = {
  appid: string;
  name: string;
  installdir: string;
  path: string;
};

// Needs to be moved to the global file I feel
declare global {
  interface Window {
    electronAPI?: {
      getInstalledEpicGames: () => Promise<EpicGameManifest[]>;
      getInstalledSteamGames: () => Promise<Game[]>;
      openFileLocation: (path: string) => void;
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
      <div className="columns is-multiline">
        {games?.map((game) => (
          <div key={game.AppName} className="column is-half">
            <Gamebox
              name={game.DisplayName}
              appid={game.CatalogItemId}
              path={game.InstallLocation}
            />
          </div>
        ))}
      </div>
    </>
  );
}
