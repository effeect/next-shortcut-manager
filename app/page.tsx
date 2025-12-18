"use client";
import { useEffect, useState, useMemo } from "react";
import Gamebox from "./components/atoms/Gamebox/Gamebox";
import { GameManifest } from "@/electron/lib/types/games";
import LoadingIcon from "./components/atoms/LoadingIcon/LoadingIcon";
import SearchBar from "./components/molecules/SearchBar/SearchBar";

declare global {
  interface Window {
    electronAPI?: {
      // Add game manifest below maybe?>
      getInstalledEpicGames: () => Promise<[]>;
      getInstalledSteamGames: () => Promise<[]>;
      getInstalledEAGames: () => Promise<[]>;
      getInstalledUbiGames: () => Promise<[]>;
      getInstalledGOGGames: () => Promise<[]>;
      openFileLocation: (path: string) => void;
      openExternal: (url: string) => void;
      getCustomSavedGames: () => Promise<[]>;
      saveCustomGame: (game: GameManifest) => void;
      selectGamePath: () => void; // May need to add a proper return
    };
  }
}

export default function GamesPage() {
  const [games, setGames] = useState<GameManifest[]>([]);
  const [loading, setLoading] = useState(true);
  // Filter States
  const [activeFilter, setActiveFilter] = useState<string>("all");
  // Search Bar Query
  const [searchQuery, setSearchQuery] = useState<string>("");
  useEffect(() => {
    const fetchAllGames = async () => {
      try {
        setLoading(true);
        const results = await Promise.all([
          window.electronAPI?.getInstalledSteamGames() || [],
          window.electronAPI?.getInstalledEpicGames() || [],
          window.electronAPI?.getInstalledEAGames() || [],
          window.electronAPI?.getInstalledUbiGames() || [],
          window.electronAPI?.getInstalledGOGGames() || [],
          window.electronAPI?.getCustomSavedGames() || [],
        ]);

        // Needed for future things
        // const combinedGames = results.flat();
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

  // Use useMemo to filter games so it doesn't re-calculate unless games or filter changes
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesPlatform =
        activeFilter === "all" ||
        game.platform.toLowerCase() === activeFilter.toLowerCase();

      const matchesSearch = game.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesPlatform && matchesSearch;
    });
  }, [games, activeFilter, searchQuery]);

  // If we are loading, show the loading icon
  if (loading) return <LoadingIcon />;
  return (
    <>
      {/* Top Search bar with the responsbility of filters and stuff*/}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <div className="columns is-multiline">
        {filteredGames?.map((game) => (
          <div key={game.appid} className="column">
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
