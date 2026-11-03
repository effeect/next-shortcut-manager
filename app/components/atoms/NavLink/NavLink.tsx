"use client"; // Needs usePathname for the active state, everything else stays server-rendered
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavLink.module.css";

type NavLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
};

const NavLink = ({ href, icon, label }: NavLinkProps) => {
  const pathname = usePathname();
  // The static export can serve /add-game as /add-game.html, so ignore the extension
  const current = pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  const active = current === href;

  return (
    <Link
      href={href}
      className={`${styles.link} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
};

export default NavLink;
