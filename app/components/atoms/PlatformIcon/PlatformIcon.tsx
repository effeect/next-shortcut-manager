import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import { SiEpicgames, SiUbisoft, SiEa, SiGogdotcom } from "react-icons/si";

const PlatformIcon = (platform: string) => {
  //   if (iconClass) return <FontAwesomeIcon icon={iconClass} className="mr-3" />;
  switch (platform) {
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
    case "gog":
      return (
        <SiGogdotcom
          className="mr-3"
          style={{ fontSize: "1.2rem", color: "#0070ff" }}
        />
      );
    default:
      return <FontAwesomeIcon icon={faGamepad} className="mr-3" />;
  }
};

export default PlatformIcon;
