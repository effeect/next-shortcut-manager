import Library from "./components/organisms/Library";
import PageHeader from "./components/molecules/PageHeader/PageHeader";
import styles from "./page.module.css";

// Server Component: the header and the loading skeleton are pre-rendered to HTML.
// Only <Library /> hydrates, because the games come from Electron over IPC.
export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Library"
        description="Every installed game from your launchers, plus the ones you've added."
      />
      <Library />
    </div>
  );
}
