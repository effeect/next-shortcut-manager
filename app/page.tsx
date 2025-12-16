import Link from "next/link";

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
            <div className="column">Placeholder</div>
            <div className="column">Placeholder</div>
          </div>
        </div>
      </section>
    </>
  );
}
