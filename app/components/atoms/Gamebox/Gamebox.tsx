import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { launchGame } from "../../../lib/LaunchHandler";
import PlatformIcon from "../PlatformIcon/PlatformIcon";
import { handleSearchOnline } from "@/app/lib/handleSearchOnline";
import { handleOpenFileLocation } from "@/app/lib/handleOpenFileLocation";
// Import the specific Brand Icons from Simple Icons (si)

type gameInfo = {
  name: string;
  path: string;
  appid: string;
  platform: string;
  iconClass?: IconDefinition;
};

const Gamebox = (params: gameInfo) => {
  return (
    <div className="box">
      <div className="is-flex is-align-items-center mb-2">
        {PlatformIcon(params.platform)}
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
          <button
            className="button is-success"
            onClick={() => handleSearchOnline(params.name)}
          >
            Search Online
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gamebox;
