// UI Helper for the Filter Tabs
const FilterButton = ({ label, id }: { label: string; id: string }) => {
  const count =
    id === "all"
      ? games.length
      : games.filter((g) => g.platform.toLowerCase() === id).length;
  const isActive = activeFilter === id;

  return (
    <li className={isActive ? "is-active" : ""}>
      <a onClick={() => setActiveFilter(id)}>
        <span>{label}</span>
        {count > 0 && (
          <span className="tag is-rounded is-small ml-2">{count}</span>
        )}
      </a>
    </li>
  );
};
