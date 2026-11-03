import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import {
  PLATFORMS,
  PLATFORM_LABELS,
  Platform,
} from "@/electron/lib/types/games";

export type LibraryFilter = "all" | Platform;

// Props for the Search Bar
type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: LibraryFilter;
  setActiveFilter: (value: LibraryFilter) => void;
  onRefresh: () => void;
  refreshing: boolean;
};

// The tabs come from PLATFORMS, so a new launcher gets a tab automatically
const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...PLATFORMS.map((id) => ({ id, label: PLATFORM_LABELS[id] })),
];

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onRefresh,
  refreshing,
}: SearchBarProps) => {
  return (
    <div className="container p-5">
      <div className="field has-addons">
        <p className="control is-expanded">
          <input
            className="input is-rounded"
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: "300px" }}
          />
        </p>
        <p className="control">
          {/* Rescans every launcher, e.g. after installing a game */}
          <button
            className={`button is-rounded ${refreshing ? "is-loading" : ""}`}
            onClick={onRefresh}
            disabled={refreshing}
            title="Rescan launchers"
          >
            <span className="icon">
              <FontAwesomeIcon icon={faRotate} />
            </span>
            <span>Refresh</span>
          </button>
        </p>
      </div>

      {/* Below Search bar, we have the tab filters */}
      <div className="tabs is-toggle is-toggle-rounded is-centered">
        <ul>
          {FILTERS.map(({ id, label }) => (
            <li key={id} className={activeFilter === id ? "is-active" : ""}>
              <a onClick={() => setActiveFilter(id)}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchBar;
