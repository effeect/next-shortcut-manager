"use client";
import { useEffect, useState, useMemo } from "react";
import Gamebox from "./components/atoms/Gamebox/Gamebox";
import { GameManifest, PLATFORM_LABELS } from "@/electron/lib/types/games";
import type { LibraryResult, ScanError } from "@/electron/types/api";
import LoadingIcon from "./components/atoms/LoadingIcon/LoadingIcon";
import SearchBar, {
  LibraryFilter,
} from "./components/molecules/SearchBar/SearchBar";

export default function GamesPage() {
  const [games, setGames] = useState<GameManifest[]>([]);
  // Launchers that couldn't be read, shown as a warning
  const [scanErrors, setScanErrors] = useState<ScanError[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // False when the page is opened in a normal browser instead of the app
  const [hasApi, setHasApi] = useState(true);
  // Filter States
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  // Search Bar Query
  const [searchQuery, setSearchQuery] = useState<string>("");

  const applyLibrary = (library: LibraryResult) => {
    setGames(library.games);
    setScanErrors(library.errors);
  };

  useEffect(() => {
    // Ignore the result if the page was left before it arrived
    let cancelled = false;
    const fetchLibrary = async () => {
      try {
        const api = window.electronAPI;
        if (!api) {
          setHasApi(false);
          return;
        }
        // Cached in the main process, so coming back to this page is instant
        const library = await api.getLibrary();
        if (!cancelled) applyLibrary(library);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLibrary();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    const api = window.electronAPI;
    if (!api) return;
    setRefreshing(true);
    try {
      applyLibrary(await api.getLibrary({ refresh: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoved = (removed: GameManifest) =>
    setGames((current) =>
      current.filter(
        (g) => !(g.platform === removed.platform && g.appid === removed.appid)
      )
    );

  // Use useMemo to filter games so it doesn't re-calculate unless games or filter changes
  const filteredGames = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return games.filter((game) => {
      const matchesPlatform =
        activeFilter === "all" || game.platform === activeFilter;
      const matchesSearch = game.name.toLowerCase().includes(query);
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
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="container px-5">
        {!hasApi && (
          <div className="notification is-info is-light">
            The library only loads inside the app. Run{" "}
            <code>npm run electron:dev</code> instead of opening this page in a
            browser.
          </div>
        )}
        {scanErrors.length > 0 && (
          <div className="notification is-warning is-light">
            <button className="delete" onClick={() => setScanErrors([])} />
            {scanErrors.map((error) => (
              <p key={error.launcher}>
                Couldn&apos;t read your {PLATFORM_LABELS[error.launcher]} games:{" "}
                {error.message}
              </p>
            ))}
          </div>
        )}
        {hasApi && filteredGames.length === 0 && (
          <p className="has-text-centered has-text-grey">No games found.</p>
        )}
      </div>

      <div className="columns is-multiline">
        {filteredGames.map((game) => (
          // Steam, Ubisoft and GOG ids are all plain numbers, so ids alone can clash
          <div key={`${game.platform}-${game.appid}`} className="column">
            <Gamebox game={game} onRemoved={handleRemoved} />
          </div>
        ))}
      </div>
    </>
  );
}
