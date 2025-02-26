import React, { Component, Fragment } from "react";
import { HashRouter, Link } from "react-router-dom";
import { classNames } from "./utils/strings";
import { Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { sourceMap, initSources } from "./sources/Sources";
import InfoModal from "./components/InfoModal.js";
import ThemeSwitcher from "./components/ThemeSwitcher.js";
import BlackholeMail from "./components/BlackholeMail.js";
import Router, { navigation } from "./Router.js";
import { purgePreviousCache } from "./utils/remotestorage";
import update from "immutability-helper";
import Spinner from "./components/Spinner";
import { science } from "./utils/science";

const DEDUP_SEARCH_MAX_TRIES = 2;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discover: {},
      searchQuery: "",
      searchResults: new Set(),
      current: undefined,
      sourcesReady: false,
    };
    this.sources = sourceMap;
    this.dedupSet = {};
  }

  setPath = (path) => {
    this.setState({
      current: path,
    });
    science("path_change");
  };

  searchHandler = (query, items) => {
    this.setState({
      searchQuery: query,
      searchResults: items,
    });
  };

  dedupItemList = (sectionTitle, mangaTileList) => {
    if (!(sectionTitle in this.dedupSet)) {
      this.dedupSet[sectionTitle] = new Set();
    }

    const dedupSet = this.dedupSet[sectionTitle];
    return mangaTileList.filter(({ mangaId, id }) => {
      let dedupId = mangaId || id;
      if (dedupSet.has(dedupId)) {
        return false;
      } else {
        dedupSet.add(dedupId);
        return true;
      }
    });
  };

  initializeDiscoverItems = () => {
    Object.entries(this.sources).forEach(([sourceName, source]) => {
      source.getHomePageSections((section) => {
        if (!section.title.startsWith(sourceName)) {
          section.title = `${sourceName} - ${section.title}`;
        }
        section.source = source;
        section.mangaUrlizer = source.getMangaUrl;
        section.sourceName = sourceName;
        section.viewMoreHandler = this.viewMoreHandler;
        if (section.containsMoreItems || section.view_more) {
          // Initialize the section with empty metadata in order to support
          // extensions that return null as a stop-signal
          section.metadata = {};
          section.hasMore = true;
        } else {
          // Use hasMore to draw the ViewMore placeholder
          section.hasMore = false;
        }
        // Only update state with sections that have items
        if (section.items && section.items.length) {
          section.items = this.dedupItemList(section.title, section.items);

          this.setState(
            update(this.state, {
              discover: { [section.title]: { $set: section } },
            })
          );
        }
      });
    });
  };

  viewMoreHandler = async (section) => {
    let runCount = 0;
    let results;
    let metadata = section.metadata;

    do {
      // Takes the section object from the above which includes metadata to continue the search
      results = await section.source.getViewMoreItems(section.id, metadata);

      metadata = results.metadata;
      results.results = this.dedupItemList(section.title, results.results);
      runCount++;
    } while (!results.results.length && runCount < DEDUP_SEARCH_MAX_TRIES);

    this.setState(
      update(this.state, {
        discover: {
          [section.title]: {
            items: { $push: results.results },
            metadata: { $set: results.metadata },
            hasMore: { $set: Boolean(results.results.length) },
          },
        },
      })
    );
    science("view_more");
  };

  componentDidMount = async () => {
    purgePreviousCache();
    await initSources();

    this.setState(
      {
        sourcesReady: true,
      },
      this.initializeDiscoverItems
    );
  };

  render() {
    return (
      <HashRouter>
        <Menu as="nav" className="bg-transparent">
          <div className="max-w-6xl mx-auto px-2 md:px-0 lg:px-0">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none">
                  {({ open }) => (
                    <Fragment>
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Fragment>
                  )}
                </Menu.Button>
              </div>
              <div className="flex-1 flex sm:ml-3 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  {/* <img
                            className="block lg:hidden h-8 w-auto"
                            src="https://cubari.moe/static/favicon.png"
                            alt="Workflow"
                          />
                          <img
                            className="hidden lg:block h-8 w-auto"
                            src="https://cubari.moe/static/favicon.png"
                            alt="Workflow"
                          /> */}
                </div>
                <div className="hidden sm:block">
                  <div className="flex space-x-4">
                    {/* Desktop layout */}
                    {Object.keys(navigation).map((item) => {
                      let name = item;
                      item = navigation[name];
                      if (!navigation[name].inNav) return undefined;
                      return (
                        <Link
                          key={name}
                          to={item.href}
                          onClick={() => {
                            this.setState({ current: name });
                          }}
                          className={classNames(
                            name === this.state.current
                              ? "bg-black text-white dark:bg-gray-800 dark:text-white"
                              : "bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                            "px-3 py-2 rounded-md text-md font-medium"
                          )}
                          aria-current={
                            name === this.state.current ? "page" : undefined
                          }
                        >
                          {name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="absolute sm:mr-3 inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <BlackholeMail />
                <ThemeSwitcher />
                <InfoModal />
              </div>
            </div>
          </div>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Item as="div" className="sm:hidden px-2 pt-2 pb-3 space-y-1">
              {/* Mobile layout */}
              {Object.keys(navigation).map((item) => {
                let name = item;
                item = navigation[name];
                if (!navigation[name].inNav) return undefined;
                return (
                  <Link
                    key={name}
                    to={item.href}
                    onClick={() => {
                      this.setState({ current: name });
                    }}
                    className={classNames(
                      name === this.state.current
                        ? "bg-black text-white dark:bg-gray-800 dark:text-white"
                        : "bg-transparent text-black hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                      "block px-3 py-2 rounded-md text-base font-medium"
                    )}
                    aria-current={
                      name === this.state.current ? "page" : undefined
                    }
                  >
                    {name}
                  </Link>
                );
              })}
            </Menu.Item>
          </Transition>
        </Menu>
        {this.state.sourcesReady ? (
          <Router app={this} />
        ) : (
          <div className="flex h-screen">
            <div className="m-auto">
              <Spinner />
            </div>
          </div>
        )}
      </HashRouter>
    );
  }
}
