"use client";
import { useEffect, useState } from "react";
import Gamebox from "../components/atoms/Gamebox/Gamebox";
import { GameManifest } from "@/electron/lib/types/games";
import { faSteam } from "@fortawesome/free-brands-svg-icons";
export default function GamesPage() {
  const [games, setGames] = useState<GameManifest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllGames = async () => {
      try {
        setLoading(true);
        const results = await Promise.all([
          window.electronAPI?.getInstalledSteamGames() || [],
          window.electronAPI?.getInstalledEpicGames() || [],
          window.electronAPI?.getInstalledEAGames() || [],
          window.electronAPI?.getInstalledUbiGames() || [],
        ]);

        // Needed for future things
        const combinedGames = results.flat();
        const combinedAndSorted = results.flat().sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        setGames(combinedAndSorted);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllGames();
  }, []);

  if (loading) return <div>Scanning libraries...</div>;
  return (
    <>
      <div className="columns is-multiline">
        {games?.map((game) => (
          <div key={game.appid} className="column is-half">
            <Gamebox
              name={game.name}
              appid={game.appid}
              path={game.path}
              platform={game.platform}
              // Can override the icon if needed
              // iconClass={}
            />
          </div>
        ))}
      </div>
    </>
  );
}
