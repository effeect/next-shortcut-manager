"use client";

import { useEffect, useState } from "react";
import Gamebox from "../components/atoms/Gamebox/Gamebox";
// Steam Type details, will fill more in later
type Game = {
  appid: string;
  name: string;
  installdir: string;
  path: string;
};

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
            <Gamebox name={game.name} appid={game.appid} path={game.path} />
          </div>
        ))}
      </div>
    </>
  );
}
