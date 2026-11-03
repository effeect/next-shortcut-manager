import GameForm from "../components/organisms/GameForm";
import styles from "../page.module.css";

// Server Component. The whole form is pre-rendered to HTML: GameForm reads ?edit=
// after mounting instead of through useSearchParams, which would force a Suspense
// boundary and leave only a fallback in the exported HTML.
export default function AddGamePage() {
  return (
    <div className={`${styles.page} ${styles.narrow}`}>
      <GameForm />
    </div>
  );
}
