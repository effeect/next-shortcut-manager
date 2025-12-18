"use client";

import { useEffect, useState } from "react";
import Gamebox from "../components/atoms/Gamebox/Gamebox";
import { GameManifest } from "@/electron/lib/types/games";

export default function InstalledGamesPage() {
  // State for the games list
  const [games, setGames] = useState<GameManifest[]>([]);

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
          <div key={game.name} className="column is-half">
            <Gamebox
              name={game.name}
              appid={game.appid}
              path={game.path}
              platform="null"
            />
          </div>
        ))}
      </div>
    </>
  );
}
