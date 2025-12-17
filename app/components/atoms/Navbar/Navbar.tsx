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
            <a className="navbar-item">Settings</a>
            <a className="navbar-item">Other</a>
            {/* <a className="navbar-item">Components</a> */}
            <hr className="navbar-divider" />
            <div className="navbar-item">PLACEHOLDER VERSION HERE</div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
