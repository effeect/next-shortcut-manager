"use client";
import React, { useState } from "react";
import Link from "next/link";
import type { GameManifest } from "@/electron/lib/types/games";
import PlatformIcon from "../PlatformIcon/PlatformIcon";
import { handleSearchOnline } from "@/app/lib/handleSearchOnline";
import { handleOpenFileLocation } from "@/app/lib/handleOpenFileLocation";

type GameboxProps = {
  game: GameManifest;
  // Called after a custom game is removed, so the page can drop the card
  onRemoved?: (game: GameManifest) => void;
};

const Gamebox = ({ game, onRemoved }: GameboxProps) => {
  const [launching, setLaunching] = useState(false);

  // Launching happens in the main process, which looks the game up itself
  const handleLaunch = async () => {
    const api = window.electronAPI;
    if (!api) return;
    setLaunching(true);
    try {
      const result = await api.launchGame(game.platform, game.appid);
      if (!result.ok) alert(result.error);
    } finally {
      setLaunching(false);
    }
  };

  const handleRemove = async () => {
    const api = window.electronAPI;
    if (!api || !confirm(`Remove "${game.name}" from your library?`)) return;
    const result = await api.removeCustomGame(game.appid);
    if (result.ok) onRemoved?.(game);
    else alert(result.error);
  };

  return (
    <div className="box">
      <div className="is-flex is-align-items-center mb-2">
        <PlatformIcon platform={game.platform} />
        <p className="title is-4 mb-0">{game.name || "Unknown Name"}</p>
      </div>
      <p className="subtitle is-6 has-text-grey">
        {game.path || "Path not valid"}
      </p>
      <div className="mt-3">
        <div className="buttons">
          <button
            className={`button is-link ${launching ? "is-loading" : ""}`}
            onClick={handleLaunch}
            disabled={launching}
          >
            Launch
          </button>
          <button
            className="button is-danger"
            onClick={() => handleOpenFileLocation(game.path)}
          >
            Open Folder Location
          </button>
          <button
            className="button is-success"
            onClick={() => handleSearchOnline(game.name)}
          >
            Search Online
          </button>
          {game.platform === "custom" && (
            <>
              <Link
                href={`/add-game?edit=${encodeURIComponent(game.appid)}`}
                className="button is-light"
              >
                Edit
              </Link>
              <button className="button is-light" onClick={handleRemove}>
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gamebox;
