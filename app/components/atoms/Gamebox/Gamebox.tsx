import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { launchGame } from "../../../lib/LaunchHandler";
import { faSteam, faWindows } from "@fortawesome/free-brands-svg-icons";
import { faGamepad, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

// Import the specific Brand Icons from Simple Icons (si)
import { SiEpicgames, SiUbisoft, SiEa } from "react-icons/si";

type gameInfo = {
  name: string;
  path: string;
  appid: string;
  platform: string;
  iconClass?: IconDefinition;
};

const handleOpenFileLocation = (filePath: string) => {
  if (window.electronAPI && filePath) {
    console.log(filePath);
    window.electronAPI.openFileLocation(filePath);
  }
};

const Gamebox = (params: gameInfo) => {
  const renderPlatformIcon = () => {
    if (params.iconClass)
      return <FontAwesomeIcon icon={params.iconClass} className="mr-3" />;
    switch (params.platform) {
      case "steam":
        return (
          <FontAwesomeIcon
            icon={faSteam}
            className="mr-3"
            style={{ color: "#1b2838" }}
          />
        );
      case "epic":
        return <SiEpicgames className="mr-3" style={{ fontSize: "1.2rem" }} />;
      case "ea":
        return (
          <SiEa
            className="mr-3"
            style={{ fontSize: "1.2rem", color: "#ff4747" }}
          />
        );
      case "ubi":
        return (
          <SiUbisoft
            className="mr-3"
            style={{ fontSize: "1.2rem", color: "#0070ff" }}
          />
        );
      default:
        return <FontAwesomeIcon icon={faGamepad} className="mr-3" />;
    }
  };
  const handleSearchOnline = () => {
    if (!params.name) return;
    const query = encodeURIComponent(params.name);
    const url = `https://www.google.com/search?q=${query}`;
    // Use the Electron API to trigger the OS browser
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      //Fallback but unlikely to hit (I think?)
      window.open(url, "_blank");
    }
  };

  return (
    <div className="box">
      <div className="is-flex is-align-items-center mb-2">
        {renderPlatformIcon()}
        <p className="title is-4 mb-0">{params.name || "Unknown Name"}</p>
      </div>
      <p className="subtitle is-6 has-text-grey">
        {params.path || "Path not valid"}
      </p>
      <div className="mt-3">
        <div className="buttons">
          <button
            className="button is-link"
            onClick={() => {
              window.open(launchGame(params));
            }}
          >
            Launch
          </button>
          <button
            className="button is-danger"
            onClick={() => handleOpenFileLocation(params.path)}
          >
            Open Folder Location
          </button>
          <button className="button is-success" onClick={handleSearchOnline}>
            Search Online
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gamebox;
