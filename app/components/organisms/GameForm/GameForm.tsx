"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuArrowLeft, LuFolderSearch, LuLoaderCircle } from "react-icons/lu";
import Alert from "../../atoms/Alert/Alert";
import PageHeader from "../../molecules/PageHeader/PageHeader";
import styles from "./GameForm.module.css";

type Message = { kind: "success" | "danger"; text: string };

const GameForm = () => {
  const router = useRouter();
  // /add-game?edit=<appid> edits an existing custom game.
  // Read after mount so the form can be pre-rendered (see add-game/page.tsx).
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (!id) return;
    setEditId(id);
    setLoadingEdit(true);

    let cancelled = false;
    const loadGame = async () => {
      try {
        const library = await window.electronAPI?.getLibrary();
        const game = library?.games.find((g) => g.platform === "custom" && g.appid === id);
        if (cancelled) return;
        if (game) {
          setName(game.name);
          setPath(game.path);
        } else {
          setMessage({ kind: "danger", text: "Couldn't find that game." });
        }
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    };
    loadGame();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectPath = async () => {
    const selectedPath = await window.electronAPI?.selectGamePath();
    if (!selectedPath) return;
    setPath(selectedPath);
    // Fill the name in from the file name if it's still empty
    if (!name.trim()) {
      const fileName = selectedPath.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, "");
      setName(fileName || "");
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const api = window.electronAPI;
    if (!api) {
      setMessage({ kind: "danger", text: "Games can only be saved inside the app." });
      return;
    }
    if (!name.trim() || !path) {
      setMessage({ kind: "danger", text: "Please enter a name and choose the game's file." });
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
        setMessage({ kind: "success", text: `Added ${result.game.name} to your library.` });
      }
    } catch (error) {
      console.error("Save failed:", error);
      setMessage({ kind: "danger", text: "Something went wrong saving the game." });
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isSaving || loadingEdit;

  return (
    <>
      <Link href="/" className={`btn btn-ghost ${styles.back}`}>
        <LuArrowLeft /> Library
      </Link>
      <PageHeader
        title={editId ? "Edit game" : "Add a game"}
        description={
          editId
            ? "Change the name or the file this game launches."
            : "Add any game or program that your launchers don't pick up."
        }
      />

      <form className={styles.card} onSubmit={handleSave}>
        {message && (
          <Alert kind={message.kind} onDismiss={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <div className={styles.field}>
          <label htmlFor="game-path" className={styles.label}>
            Game file
          </label>
          <div className={styles.pathRow}>
            <input
              id="game-path"
              className="input mono"
              type="text"
              placeholder="C:\Games\Game.exe"
              value={path}
              readOnly
              onClick={handleSelectPath}
              disabled={busy}
            />
            <button type="button" className="btn" onClick={handleSelectPath} disabled={busy}>
              <LuFolderSearch /> Browse
            </button>
          </div>
          <p className={styles.hint}>An .exe, shortcut (.lnk / .url) or script that starts the game.</p>
        </div>

        <div className={styles.field}>
          <label htmlFor="game-name" className={styles.label}>
            Name
          </label>
          <input
            id="game-name"
            className="input"
            type="text"
            placeholder="e.g. Minecraft"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
          <p className={styles.hint}>Filled in from the file name if you leave it empty.</p>
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {isSaving && <LuLoaderCircle className="spin" />}
            {editId ? "Save changes" : "Add to library"}
          </button>
        </div>
      </form>
    </>
  );
};

export default GameForm;
