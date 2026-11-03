import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import { SiEpicgames, SiUbisoft, SiEa, SiGogdotcom } from "react-icons/si";
import type { Platform } from "@/electron/lib/types/games";

// Record<Platform, ...> means TypeScript flags a missing icon when a platform is added
const ICONS: Record<Platform, ReactNode> = {
  steam: (
    <FontAwesomeIcon
      icon={faSteam}
      className="mr-3"
      style={{ color: "#1b2838" }}
    />
  ),
  epic: <SiEpicgames className="mr-3" style={{ fontSize: "1.2rem" }} />,
  ea: <SiEa className="mr-3" style={{ fontSize: "1.2rem", color: "#ff4747" }} />,
  ubi: (
    <SiUbisoft
      className="mr-3"
      style={{ fontSize: "1.2rem", color: "#0070ff" }}
    />
  ),
  gog: (
    <SiGogdotcom
      className="mr-3"
      style={{ fontSize: "1.2rem", color: "#0070ff" }}
    />
  ),
  custom: <FontAwesomeIcon icon={faGamepad} className="mr-3" />,
};

const PlatformIcon = ({ platform }: { platform: Platform }) => (
  <>{ICONS[platform]}</>
);

export default PlatformIcon;
