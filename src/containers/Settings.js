import React, { PureComponent } from "react";

export default class Settings extends PureComponent {
  render() {
    return (
      <div className="columns is-mobile is-multiline">
        <section className="hero column is-full">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Settings</h1>
            </div>
          </div>
        </section>
        <div className="container">
          <div className="columns is-mobile is-multiline">
            <div className="column is-2"></div>
            <div className="column is-8">
              <div className="card">
                <header className="card-header">
                  <p className="card-header-title">Source</p>
                  <a
                    href="#"
                    className="card-header-icon"
                    aria-label="more options"
                  >
                    <span className="icon">
                      <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                  </a>
                </header>
                <footer className="card-footer">
                  <a href="#" className="card-footer-item selected">
                    Enabled
                  </a>
                  <a href="#" className="card-footer-item">
                    Disabled
                  </a>
                </footer>
              </div>
            </div>
            <div className="column is-2"></div>
          </div>
        </div>
      </div>
    );
  }
}
