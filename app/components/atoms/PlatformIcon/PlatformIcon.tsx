import type { IconType } from "react-icons";
import { SiEa, SiEpicgames, SiGogdotcom, SiSteam, SiUbisoft } from "react-icons/si";
import { LuGamepad2 } from "react-icons/lu";
import type { Platform } from "@/electron/lib/types/games";

// Record<Platform, ...> means TypeScript flags a missing icon when a platform is added
const ICONS: Record<Platform, IconType> = {
  steam: SiSteam,
  epic: SiEpicgames,
  ea: SiEa,
  ubi: SiUbisoft,
  gog: SiGogdotcom,
  custom: LuGamepad2,
};

// The matching colour token in globals.css (--platform-steam etc.)
export const platformColor = (platform: Platform) => `var(--platform-${platform})`;

type PlatformIconProps = {
  platform: Platform;
  className?: string;
  // Tint the icon with the launcher's colour
  colored?: boolean;
};

// No hooks, so it renders on the server and inside client components alike
const PlatformIcon = ({ platform, className, colored }: PlatformIconProps) => {
  const Icon = ICONS[platform];
  return (
    <Icon
      className={className}
      style={colored ? { color: platformColor(platform) } : undefined}
      // Always shown next to the launcher's name, so hide it from screen readers
      aria-hidden
    />
  );
};

export default PlatformIcon;
