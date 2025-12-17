"use client";

import { useEffect, useState } from "react";
import Gamebox from "../components/atoms/Gamebox/Gamebox";

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
      window.electronAPI?.getInstalledEAGames
    ) {
      window.electronAPI.getInstalledEAGames().then((data) => {
        console.log(data);
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
            <Gamebox name={game.name} appid={game.appid} path={game.path} />
          </div>
        ))}
      </div>
    </>
  );
}
