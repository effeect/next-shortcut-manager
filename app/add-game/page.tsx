"use client";
import React, { useState } from "react";

export default function AddGamePage() {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const [isSaving, setIsSaving] = useState(false);

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
    if (!name || !path) {
      alert("Please enter a name and select a path.");
      return;
    }

    setIsSaving(true);
    const newGame = {
      name,
      path,
      appid: `custom-${Date.now()}`, // Generate a unique ID
      platform: "custom",
    };

    try {
      await window.electronAPI?.saveCustomGame(newGame);

      alert("Thing added");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container p-6">
      <div className="columns is-centered">
        <div className="column is-two-thirds">
          <div className="box">
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
              <button className="button is-light is-medium">(Cancel)</button>
              <button
                className={`button is-primary is-medium ${
                  isSaving ? "is-loading" : ""
                }`}
                onClick={handleSave}
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
