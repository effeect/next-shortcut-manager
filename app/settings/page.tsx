import { LAUNCHERS, PLATFORM_LABELS } from "@/electron/lib/types/games";
import PlatformIcon from "../components/atoms/PlatformIcon/PlatformIcon";
import PageHeader from "../components/molecules/PageHeader/PageHeader";
import pageStyles from "../page.module.css";
import styles from "./settings.module.css";

// Pure Server Component: no client JavaScript is shipped for this page.
export default function SettingsPage() {
  return (
    <div className={`${pageStyles.page} ${pageStyles.narrow}`}>
      <PageHeader title="Settings" description="More options are on the way." />

      <section className={styles.section}>
        <h2 className={styles.heading}>Supported launchers</h2>
        <p className={styles.text}>
          These launchers are scanned automatically. Use <strong>Rescan</strong> in the library
          after installing something new.
        </p>
        <ul className={styles.launchers}>
          {LAUNCHERS.map((id) => (
            <li key={id} className={styles.launcher}>
              <PlatformIcon platform={id} colored className={styles.launcherIcon} />
              {PLATFORM_LABELS[id]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
