"use client";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  LuFolderOpen,
  LuGlobe,
  LuLoaderCircle,
  LuPencil,
  LuPlay,
  LuTrash2,
} from "react-icons/lu";
import { PLATFORM_LABELS, type GameManifest } from "@/electron/lib/types/games";
import PlatformIcon, { platformColor } from "../../atoms/PlatformIcon/PlatformIcon";
import { handleSearchOnline } from "@/app/lib/handleSearchOnline";
import { handleOpenFileLocation } from "@/app/lib/handleOpenFileLocation";
import styles from "./GameCard.module.css";

type GameCardProps = {
  game: GameManifest;
  // Called after a custom game is removed, so the page can drop the card
  onRemoved?: (game: GameManifest) => void;
};

// "Half-Life 2" -> "HL", "Celeste" -> "CE"
const initials = (name: string) => {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const GameCard = ({ game, onRemoved }: GameCardProps) => {
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = game.name || "Unknown game";

  // Launching happens in the main process, which looks the game up itself
  const handleLaunch = async () => {
    const api = window.electronAPI;
    if (!api) return;
    setLaunching(true);
    setError(null);
    try {
      const result = await api.launchGame(game.platform, game.appid);
      if (!result.ok) setError(result.error);
    } finally {
      setLaunching(false);
    }
  };

  const handleRemove = async () => {
    const api = window.electronAPI;
    if (!api || !confirm(`Remove "${name}" from your library?`)) return;
    const result = await api.removeCustomGame(game.appid);
    if (result.ok) onRemoved?.(game);
    else setError(result.error);
  };

  return (
    <article
      className={styles.card}
      style={{ "--tint": platformColor(game.platform) } as CSSProperties}
    >
      <div className={styles.cover} aria-hidden>
        <span className={styles.monogram}>{initials(name)}</span>
      </div>
      <span className={styles.badge}>
        <PlatformIcon platform={game.platform} />
        {PLATFORM_LABELS[game.platform]}
      </span>

      <div className={styles.body}>
        <h2 className={styles.name} title={name}>
          {name}
        </h2>
        <p className={`mono ${styles.path}`} title={game.path}>
          {/* bdi keeps the path's own LTR order inside the RTL (start-truncating) box */}
          <bdi dir="ltr">{game.path || "No install path"}</bdi>
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`btn btn-primary ${styles.play}`}
          onClick={handleLaunch}
          disabled={launching}
        >
          {launching ? <LuLoaderCircle className="spin" /> : <LuPlay />}
          {launching ? "Launching" : "Play"}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => handleOpenFileLocation(game.path)}
          disabled={!game.path}
          title="Open install folder"
          aria-label="Open install folder"
        >
          <LuFolderOpen />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => handleSearchOnline(name)}
          title="Search online"
          aria-label="Search online"
        >
          <LuGlobe />
        </button>
        {game.platform === "custom" && (
          <>
            <Link
              href={`/add-game?edit=${encodeURIComponent(game.appid)}`}
              className="btn btn-ghost btn-icon"
              title="Edit"
              aria-label="Edit"
            >
              <LuPencil />
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-danger"
              onClick={handleRemove}
              title="Remove from library"
              aria-label="Remove from library"
            >
              <LuTrash2 />
            </button>
          </>
        )}
      </div>
    </article>
  );
};

// Placeholder shown (and pre-rendered into the HTML) while the library loads
export const GameCardSkeleton = () => (
  <div className={`${styles.card} ${styles.skeleton}`} aria-hidden>
    <div className={styles.cover} />
    <div className={styles.body}>
      <span className={styles.line} style={{ width: "70%" }} />
      <span className={styles.line} style={{ width: "90%", height: 10 }} />
    </div>
    <div className={styles.actions}>
      <span className={styles.line} style={{ width: "100%", height: 36 }} />
    </div>
  </div>
);

export default GameCard;
