// Props for the Search Bar
type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
};

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}: SearchBarProps) => {
  return (
    <div className="container p-5">
      <div className="field">
        <p className="control has-icons-center">
          <input
            className="input is-rounded"
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: "300px" }}
          />
        </p>
      </div>

      {/* Below Search bar, we have the tab filters */}
      {/* Should be */}
      <div className="tabs is-toggle is-toggle-rounded is-centered">
        <ul>
          <li className={activeFilter === "all" ? "is-active" : ""}>
            <a onClick={() => setActiveFilter("all")}>All</a>
          </li>
          <li className={activeFilter === "steam" ? "is-active" : ""}>
            <a onClick={() => setActiveFilter("steam")}>Steam</a>
          </li>
          <li className={activeFilter === "epic" ? "is-active" : ""}>
            <a onClick={() => setActiveFilter("epic")}>Epic</a>
          </li>
          <li className={activeFilter === "ea" ? "is-active" : ""}>
            <a onClick={() => setActiveFilter("ea")}>EA</a>
          </li>
          <li className={activeFilter === "ubi" ? "is-active" : ""}>
            <a onClick={() => setActiveFilter("ubi")}>Ubisoft</a>
          </li>
          <li className={activeFilter === "gog" ? "is-active" : ""}>
            <a onClick={() => setActiveFilter("gog")}>GOG</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SearchBar;
