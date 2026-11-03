import Link from "next/link";
import { LuGamepad2, LuLibrary, LuPlus, LuSettings } from "react-icons/lu";
import NavLink from "../../atoms/NavLink";
import styles from "./Sidebar.module.css";

// Server Component. Only NavLink is a client component (it needs the current path).
const Sidebar = () => (
  <nav className={styles.sidebar} aria-label="Main navigation">
    <Link href="/" className={styles.brand}>
      <span className={styles.logo}>
        <LuGamepad2 aria-hidden />
      </span>
      <span className={styles.brandText}>
        Shortcut
        <br />
        Manager
      </span>
    </Link>

    <div className={styles.links}>
      <NavLink href="/" icon={<LuLibrary />} label="Library" />
      <NavLink href="/add-game" icon={<LuPlus />} label="Add game" />
    </div>

    <div className={styles.footer}>
      <NavLink href="/settings" icon={<LuSettings />} label="Settings" />
    </div>
  </nav>
);

export default Sidebar;
