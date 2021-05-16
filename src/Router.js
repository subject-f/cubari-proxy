import React, { Fragment, PureComponent } from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import Discover from "./containers/Discover.js";
import Search from "./containers/Search.js";
import History from "./containers/History.js";
import Saved from "./containers/Saved.js";
import Settings from "./containers/Settings.js";
import PageNotFound from "./containers/PageNotFound.js";

export const navigation = {
  Discover: {
    href: "/",
    inNav: true,
    component: (app) => (
      <Discover discover={app.state.discover} setPath={app.setPath} />
    ),
  },
  Search: {
    href: "/search",
    inNav: true,
    component: (app) => (
      <Search
        searchResults={app.state.searchResults}
        searchQuery={app.state.searchQuery}
        searchHandler={app.searchHandler}
        sources={app.sources}
        setPath={app.setPath}
      />
    ),
  },
  History: {
    href: "/history",
    inNav: true,
    component: (app) => <History setPath={app.setPath} />,
  },
  Saved: {
    href: "/saved",
    inNav: true,
    component: (app) => <Saved setPath={app.setPath} />,
  },
  Settings: {
    href: "/settings",
    inNav: true,
    component: (app) => <Settings setPath={app.setPath} />,
  },
};

class Router extends PureComponent {
  render() {
    return (
      <Fragment>
        <Switch>
          {Object.values(navigation).map((item) => {
            return (
              <Route exact path={item.href} key={item.href}>
                {item.component(this.props.app)}
              </Route>
            );
          })}
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Fragment>
    );
  }
}

export default withRouter(Router);
