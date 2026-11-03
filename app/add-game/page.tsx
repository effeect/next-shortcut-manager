"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingIcon from "../components/atoms/LoadingIcon/LoadingIcon";

type Message = { kind: "success" | "danger"; text: string };

function AddGameForm() {
  const router = useRouter();
  // /add-game?edit=<appid> edits an existing custom game
  const editId = useSearchParams().get("edit");

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Fill the form in when editing
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    const loadGame = async () => {
      const library = await window.electronAPI?.getLibrary();
      const game = library?.games.find(
        (g) => g.platform === "custom" && g.appid === editId
      );
      if (cancelled) return;
      if (game) {
        setName(game.name);
        setPath(game.path);
      } else {
        setMessage({ kind: "danger", text: "Couldn't find that game." });
      }
    };
    loadGame();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const handleSelectPath = async () => {
    const selectedPath = await window.electronAPI?.selectGamePath();
    if (selectedPath) {
      setPath(selectedPath);
      // Optional: Auto-fill name from the filename if name is empty
      if (!name) {
        const fileName = selectedPath
          .split(/[\\/]/)
          .pop()
          ?.replace(/\.[^/.]+$/, "");
        setName(fileName || "");
      }
    }
  };

  const handleSave = async () => {
    const api = window.electronAPI;
    if (!api) return;
    if (!name.trim() || !path) {
      setMessage({ kind: "danger", text: "Please enter a name and select a path." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      // The main process checks the details and creates the id
      const result = editId
        ? await api.updateCustomGame(editId, { name, path })
        : await api.saveCustomGame({ name, path });

      if (!result.ok) {
        setMessage({ kind: "danger", text: result.error });
      } else if (editId) {
        router.push("/");
      } else {
        // Ready for the next one
        setName("");
        setPath("");
        setMessage({
          kind: "success",
          text: `Added ${result.game.name} to your library.`,
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
      setMessage({ kind: "danger", text: "Something went wrong saving the game." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container p-6">
      <div className="columns is-centered">
        <div className="column is-two-thirds">
          <div className="box">
            {message && (
              <div className={`notification is-${message.kind} is-light`}>
                <button className="delete" onClick={() => setMessage(null)} />
                {message.text}
              </div>
            )}

            {/* Game Name Input */}
            <div className="field">
              <label className="label">Game Name</label>
              <div className="control">
                <input
                  className="input is-medium"
                  type="text"
                  placeholder="e.g. Minecraft"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Path Selection */}
            <div className="field">
              <label className="label"> (Executable Path)</label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="C:\Games\Game.exe"
                    value={path}
                    readOnly
                  />
                </div>
                <div className="control">
                  <button
                    className="button is-info is-medium"
                    onClick={handleSelectPath}
                  >
                    <span>(Browse)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="buttons is-right mt-6">
              <button
                className="button is-light is-medium"
                onClick={() => router.push("/")}
              >
                (Cancel)
              </button>
              <button
                className={`button is-primary is-medium ${
                  isSaving ? "is-loading" : ""
                }`}
                onClick={handleSave}
                disabled={isSaving}
              >
                (Save)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary for the static export
export default function AddGamePage() {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <AddGameForm />
    </Suspense>
  );
}
