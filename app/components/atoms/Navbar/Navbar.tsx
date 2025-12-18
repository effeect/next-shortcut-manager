// Taken from this https://bulma.io/documentation/components/navbar/
"use client"; // Required for hover states and hooks
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGamepad,
  faCog,
  faPlus,
  faChevronDown,
  faBook,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const pathname = usePathname();
  // Helper to highlight active links
  const isActive = (path: string) => (pathname === path ? "is-active" : "");
  return (
    <>
      <nav
        className="navbar is-dark mb-5"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container">
          <div className="navbar-brand">
            <Link
              href="/"
              className="navbar-item"
              style={{ cursor: "default" }}
            >
              <span className="icon is-medium has-text-primary mr-2">
                <FontAwesomeIcon icon={faGamepad} size="lg" />
              </span>
              <h1 className="title is-4 has-text-white mb-0">
                Next Shortcut Manager
              </h1>
            </Link>
          </div>
          <div className="navbar-menu">
            <div className="navbar-end">
              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link is-arrowless">
                  <span>Options</span>
                  <span className="icon is-small ml-1">
                    <FontAwesomeIcon icon={faChevronDown} />
                  </span>
                </a>

                <div className="navbar-dropdown is-right">
                  {/* Add Game Link */}
                  <Link
                    href="/add-game"
                    className={`navbar-item ${isActive("/add-game")}`}
                  >
                    <span className="icon has-text-success mr-2">
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                    <span>Add Custom Game</span>
                  </Link>

                  {/* Settings Link */}
                  <Link
                    href="/settings"
                    className={`navbar-item ${isActive("/settings")}`}
                  >
                    <span className="icon has-text-info mr-2">
                      <FontAwesomeIcon icon={faCog} />
                    </span>
                    <span>Settings</span>
                  </Link>

                  <hr className="navbar-divider" />

                  {/* Library/Home Link */}
                  <Link href="/" className={`navbar-item ${isActive("/")}`}>
                    <span className="icon mr-2">
                      <FontAwesomeIcon icon={faBook} />
                    </span>
                    <span>Library</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
