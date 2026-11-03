"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LuPlus, LuSearchX } from "react-icons/lu";
import {
  PLATFORM_LABELS,
  type GameManifest,
  type Platform,
} from "@/electron/lib/types/games";
import type { LibraryResult, ScanError } from "@/electron/types/api";
import Alert from "../../atoms/Alert/Alert";
import GameCard, { GameCardSkeleton } from "../../molecules/GameCard/GameCard";
import SearchBar, { type LibraryFilter } from "../../molecules/SearchBar/SearchBar";
import styles from "./Library.module.css";

const SKELETON_COUNT = 8;

const gameKey = (game: GameManifest) => `${game.platform}-${game.appid}`;

const Library = () => {
  const [games, setGames] = useState<GameManifest[]>([]);
  // Launchers that couldn't be read, shown as a warning
  const [scanErrors, setScanErrors] = useState<ScanError[]>([]);
  // Starts true so the pre-rendered HTML is the skeleton grid
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // False when the page is opened in a normal browser instead of the app
  const [hasApi, setHasApi] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const applyLibrary = (library: LibraryResult) => {
    setGames([...library.games].sort((a, b) => a.name.localeCompare(b.name)));
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
    setGames((current) => current.filter((g) => gameKey(g) !== gameKey(removed)));

  // How many games each launcher has, for the filter chips
  const counts = useMemo(() => {
    const result: Partial<Record<Platform, number>> = {};
    for (const game of games) result[game.platform] = (result[game.platform] ?? 0) + 1;
    return result;
  }, [games]);

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return games.filter(
      (game) =>
        (activeFilter === "all" || game.platform === activeFilter) &&
        game.name.toLowerCase().includes(query)
    );
  }, [games, activeFilter, searchQuery]);

  const isFiltering = searchQuery.trim() !== "" || activeFilter !== "all";

  return (
    <>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        counts={counts}
        total={games.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        disabled={loading || !hasApi}
      />

      <div className={styles.notices}>
        {!hasApi && (
          <Alert kind="info">
            <span>
              The library only loads inside the app. Run{" "}
              <code>npm run electron:dev</code> instead of opening this page in a browser.
            </span>
          </Alert>
        )}
        {scanErrors.length > 0 && (
          <Alert kind="warning" onDismiss={() => setScanErrors([])}>
            {scanErrors.map((error) => (
              <span key={error.launcher}>
                Couldn&apos;t read your {PLATFORM_LABELS[error.launcher]} games: {error.message}
              </span>
            ))}
          </Alert>
        )}
      </div>

      {loading ? (
        <div className={styles.grid} aria-busy="true" aria-label="Loading your library">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        <div className={styles.grid}>
          {filteredGames.map((game) => (
            // Steam, Ubisoft and GOG ids are all plain numbers, so ids alone can clash
            <GameCard key={gameKey(game)} game={game} onRemoved={handleRemoved} />
          ))}
        </div>
      ) : hasApi ? (
        <div className={styles.empty}>
          <LuSearchX className={styles.emptyIcon} aria-hidden />
          {isFiltering ? (
            <>
              <h2>No matches</h2>
              <p>Nothing in your library matches the current search or filter.</p>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h2>No games found</h2>
              <p>We didn&apos;t find any installed games. Add one yourself, or rescan after installing.</p>
              <Link href="/add-game" className="btn btn-primary">
                <LuPlus /> Add a game
              </Link>
            </>
          )}
        </div>
      ) : null}
    </>
  );
};

export default Library;
