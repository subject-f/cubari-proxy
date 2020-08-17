import React, { Component } from "react";
import { HashRouter, Switch, Route, Link } from "react-router-dom";
import Discover from "./containers/Discover.js";
import Search from "./containers/Search.js";
import History from "./containers/History.js";
// import Settings from "./containers/Settings.js";
import PageNotFound from "./containers/PageNotFound.js";
import sourcemap from "./sources/sourcemap.js";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discover: new Set(),
    };
    this.sources = Object.values(sourcemap);
  }

  initializeMobileMenu = () => {
    const nav = document.getElementById("navMenu");

    const $navbarBurgers = Array.prototype.slice.call(
      document.querySelectorAll(".navbar-burger"),
      0
    );
    if ($navbarBurgers.length > 0) {
      $navbarBurgers.forEach((el) => {
        el.addEventListener("click", () => {
          el.classList.toggle("is-active");
          nav.classList.toggle("is-active");
        });
      });
    }

    const navItems = Array.prototype.slice.call(
      document.querySelectorAll(".ni"),
      0
    );

    navItems.forEach((e) => {
      e.addEventListener("click", () => {
        document.querySelector(".navbar-burger").classList.remove("is-active");
        nav.classList.remove("is-active");
      });
    });
  };

  initializeDiscoverItems = () => {
    this.sources.forEach((source) => {
      let baseReqs = source.getHomePageSectionRequest();
      baseReqs.forEach((homeSection) => {
        homeSection
          .request()
          .then((e) => e.text())
          .then((e) => {
            source
              .getHomePageSections(e, homeSection.sections)
              .forEach((section) => {
                section.source = source;
                section.mangaUrlizer = source.getMangaUrl;
                this.setState({
                  discover: new Set(this.state.discover).add(section),
                });
              });
          });
      });
    });
  };

  componentDidMount = () => {
    this.initializeMobileMenu();
    this.initializeDiscoverItems();
  };

  render() {
    return (
      <HashRouter>
        <nav
          className="navbar is-light"
          role="navigation"
          aria-label="main navigation"
        >
          <div className="container">
            <div className="navbar-brand">
              <div className="navbar-item navbar-logo">
                <Link to="/">
                  <img src="https://guya.moe/static/logo_small.png" alt="logo" />
                </Link>
              </div>
              {/* eslint-disable-next-line */}
              <a
                role="button"
                className="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </a>
            </div>

            <div id="navMenu" className="navbar-menu">
              <div className="navbar-start">
                <Link className="navbar-item ni" to="/">
                  Discover
                </Link>
                <Link className="navbar-item ni" to="/search">
                  Search
                </Link>
                <Link className="navbar-item ni" to="/history">
                  History
                </Link>
              </div>
              {/* <div className="navbar-end">
                <Link className="navbar-item ni" to="/settings">
                  Settings
                </Link>
              </div> */}
            </div>
          </div>
        </nav>
        <div className="container is-fluid">
          <div className="container">
            <Switch>
              <Route exact path="/">
                <Discover discover={this.state.discover} />
              </Route>
              <Route exact path="/search">
                <Search sources={this.sources} />
              </Route>
              <Route exact path="/history">
                <History />
              </Route>
              {/* <Route exact path="/settings">
                <Settings />
              </Route> */}
              <Route>
                <PageNotFound />
              </Route>
            </Switch>
          </div>
        </div>
      </HashRouter>
    );
  }
}
