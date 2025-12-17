import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";

import {
  faSteam,
  faWindows,
  faItunesNote, // Example for others
} from "@fortawesome/free-brands-svg-icons";
import { faGamepad, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

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

const PLATFORM_ICONS: Record<string, IconDefinition> = {
  steam: faSteam,
  epic: faGamepad, // Epic doesn't have a FA brand icon, faGamepad is a good fallback
  ea: faWindows,
  ubi: faGamepad,
};

const Gamebox = (params: gameInfo) => {
  const iconToRender =
    params.iconClass || PLATFORM_ICONS[params.platform] || faGamepad;
  return (
    <div className="box">
      <p className="title is-4">
        <FontAwesomeIcon icon={iconToRender} className="mr-3" />
        {params.name || "Unknown Name"}
      </p>
      <p className="subtitle is-6 has-text-grey">
        {params.path || "Path not valid"}
      </p>
      <div className="mt-3">
        <div className="buttons">
          <button
            className="button is-link"
            onClick={() =>
              window.open(`steam://run/${params.appid || "Unknown App ID"}`)
            }
          >
            Launch
          </button>
          <button
            className="button is-danger"
            onClick={() => handleOpenFileLocation(params.path)}
          >
            Open Folder Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gamebox;
