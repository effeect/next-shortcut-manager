import { LuRefreshCw, LuSearch } from "react-icons/lu";
import { PLATFORMS, PLATFORM_LABELS, type Platform } from "@/electron/lib/types/games";
import PlatformIcon from "../../atoms/PlatformIcon/PlatformIcon";
import styles from "./SearchBar.module.css";

export type LibraryFilter = "all" | Platform;

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: LibraryFilter;
  setActiveFilter: (value: LibraryFilter) => void;
  // Games per launcher, so chips can show counts and empty launchers can be hidden
  counts: Partial<Record<Platform, number>>;
  total: number;
  onRefresh: () => void;
  refreshing: boolean;
  disabled?: boolean;
};

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  counts,
  total,
  onRefresh,
  refreshing,
  disabled,
}: SearchBarProps) => {
  // Only show launchers that have games (plus whichever is selected, so it can be cleared)
  const visiblePlatforms = PLATFORMS.filter(
    (id) => (counts[id] ?? 0) > 0 || id === activeFilter
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <label className={styles.search}>
          <span className="visually-hidden">Search your library</span>
          <LuSearch className={styles.searchIcon} aria-hidden />
          <input
            className={`input ${styles.searchInput}`}
            type="search"
            placeholder="Search your library…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
          />
        </label>
        {/* Rescans every launcher, e.g. after installing a game */}
        <button
          type="button"
          className="btn"
          onClick={onRefresh}
          disabled={disabled || refreshing}
          title="Rescan launchers"
        >
          <LuRefreshCw className={refreshing ? "spin" : undefined} />
          <span>{refreshing ? "Scanning…" : "Rescan"}</span>
        </button>
      </div>

      <div className={styles.chips} role="group" aria-label="Filter by launcher">
        <button
          type="button"
          className={styles.chip}
          aria-pressed={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          disabled={disabled}
        >
          All <span className={styles.count}>{total}</span>
        </button>
        {visiblePlatforms.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.chip}
            aria-pressed={activeFilter === id}
            onClick={() => setActiveFilter(id)}
          >
            <PlatformIcon platform={id} colored />
            {PLATFORM_LABELS[id]}
            <span className={styles.count}>{counts[id] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
