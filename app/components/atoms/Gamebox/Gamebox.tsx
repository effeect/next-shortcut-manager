import React from "react";

type gameInfo = {
  name: string;
  path: string;
  appid: string;
};

const Gamebox = (params: gameInfo) => {
  return (
    <div className="box">
      <p className="title is-4">{params.name || "Unknown Name"}</p>
      <p className="subtitle is-6 has-text-grey">
        {params.path || "Path not valid"}
      </p>
      <div className="mt-3">
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
          onClick={() => window.open("Install Location")}
        >
          Open File Location (PLACEHOLDER)
        </button>
      </div>
    </div>
  );
};

export default Gamebox;
