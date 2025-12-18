import Link from "next/link";

declare global {
  interface Window {
    electronAPI?: {
      getInstalledEpicGames: () => Promise<[]>;
      getInstalledSteamGames: () => Promise<[]>;
      getInstalledEAGames: () => Promise<[]>;
      getInstalledUbiGames: () => Promise<[]>;
      getInstalledGOGGames: () => Promise<[]>;
      openFileLocation: (path: string) => void;
      openExternal: (url: string) => void;
    };
  }
}

export default function Home() {
  return (
    <>
      <section className="hero is-medium is-info">
        <div className="hero-body">
          <p className="title">Next Shortcut Manager</p>
          <div className="columns">
            <div className="column">
              <Link href="/steam">Steam List</Link>
            </div>
            <div className="column">
              {" "}
              <Link href="/epic">Epic List</Link>
            </div>
            <div className="column">
              {" "}
              <Link href="/ea">EA List</Link>
            </div>
            <div className="column">
              {" "}
              <Link href="/ubi">Ubisoft List</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
