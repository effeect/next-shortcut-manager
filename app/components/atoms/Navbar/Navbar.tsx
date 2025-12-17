// Taken from this https://bulma.io/documentation/components/navbar/
const Navbar = () => {
  return (
    <>
      <nav
        className="navbar"
        role="navigation"
        aria-label="dropdown navigation"
      >
        <div className="navbar-item">
          <div className="field is-grouped">
            <p className="control">
              <a className="button is-primary" href="/games">
                <span>All Games</span>
              </a>
            </p>
            <p className="control">
              <a className="button is-primary">
                <span>Steam</span>
              </a>
            </p>
            <p className="control">
              <a className="button is-primary">
                <span>Epic</span>
              </a>
            </p>
            <p className="control">
              <a className="button is-primary">
                <span>EA</span>
              </a>
            </p>
            <p className="control">
              <a className="button is-primary">
                <span>Ubisoft</span>
              </a>
            </p>
          </div>
        </div>

        {/* Below is the settings menu and other misc stuff */}
        <div className="navbar-item has-dropdown is-hoverable">
          <a className="navbar-link">Options</a>

          <div className="navbar-dropdown">
            <a className="navbar-item" href="/settings">
              Settings
            </a>
            <a className="navbar-item">Other</a>
            <hr className="navbar-divider" />
            <div className="navbar-item">Prerelease</div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
