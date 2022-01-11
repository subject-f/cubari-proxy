import React, { Fragment, PureComponent } from "react";
import observer from "../utils/observer";
import { Transition } from "@headlessui/react";
import { HeartIcon, XIcon } from "@heroicons/react/solid";
import { classNames } from "../utils/strings";
import { globalHistoryHandler } from "../utils/remotestorage";
import { mangaUrlSaver } from "../utils/compatability";
import { tailwindConfig } from "../utils/tailwind";
import { SpinIcon } from "./Spinner";

const breakpointElementCountMap = {
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  "2xl": 6,
};

const breakpoints = Object.entries(tailwindConfig.theme.screens).map(
  ([breakpoint, pixelValue]) => [
    pixelValue.slice(0, -2),
    breakpointElementCountMap[breakpoint],
  ]
);

export default class MangaCard extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      saved: undefined,
      saving: true,
      removing: false,
      elementWidth: 225, // We need a default width for other pre-init calculations
    };
  }

  consolidateState = (state) => {
    // Ensure the component is still mounted
    if (this.ref.current) {
      this.setState(state);
    }
  };

  saveToHistory = () => {
    return globalHistoryHandler
      .pushSeries(
        this.props.slug,
        this.props.coverUrl,
        this.props.sourceName,
        mangaUrlSaver(this.props.mangaUrlizer(this.props.slug)),
        this.props.mangaTitle
      )
      .then(() => {
        let resultingState = {
          removing: false,
        };
        if (this.props.storageCallback) {
          this.props.storageCallback().then(() => {
            this.consolidateState(resultingState);
          });
        } else {
          this.consolidateState(resultingState);
        }
      });
  };

  removeFromHistory = () => {
    return globalHistoryHandler
      .removeSeries(this.props.slug, this.props.sourceName)
      .then(() => {
        let resultingState = {
          removing: false,
        };
        if (this.props.storageCallback) {
          this.props.storageCallback().then(() => {
            this.consolidateState(resultingState);
          });
        } else {
          this.consolidateState(resultingState);
        }
      });
  };

  saveToPin = () => {
    return globalHistoryHandler
      .pinSeries(
        this.props.slug,
        this.props.coverUrl,
        this.props.sourceName,
        mangaUrlSaver(this.props.mangaUrlizer(this.props.slug)),
        this.props.mangaTitle
      )
      .then(() => {
        let resultingState = {
          saving: false,
          saved: true,
        };
        if (this.props.storageCallback) {
          this.props.storageCallback().then(() => {
            this.consolidateState(resultingState);
          });
        } else {
          this.consolidateState(resultingState);
        }
      });
  };

  removeFromPin = () => {
    return globalHistoryHandler
      .unpinSeries(this.props.slug, this.props.sourceName)
      .then(() => {
        let resultingState = {
          saving: false,
          saved: false,
        };
        if (this.props.storageCallback) {
          this.props.storageCallback().then(() => {
            this.consolidateState(resultingState);
          });
        } else {
          this.consolidateState(resultingState);
        }
      });
  };

  addHistoryHandler = (e) => {
    this.setState(
      {
        removing: true,
      },
      this.saveToHistory
    );
  };

  removeHistoryHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.removing) {
      this.setState(
        {
          removing: true,
        },
        this.removeFromHistory
      );
    }
    return false;
  };

  pinHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.saving) {
      this.setState(
        {
          saving: true,
        },
        () => {
          if (!this.state.saved) {
            this.saveToPin();
          } else {
            this.removeFromPin();
          }
        }
      );
    }
    return false;
  };

  resizeHandler = () => {
    // Note: this handler is ugly as _fuck_, but it's one way of
    // resizing the element without the parent scroller passing any state
    // down, which means its size is contained within this component.
    // Tradeoffs, I suppose.

    const paddingLayer = this.ref.current.parentElement;
    const sizingLayer = paddingLayer.parentElement;
    const animationLayer = sizingLayer.parentElement;
    const flexboxScrollable = animationLayer.parentElement;
    const actualContainer = flexboxScrollable.parentElement;

    const actualContainerWidth = actualContainer.clientWidth;

    let finalElements = 0;
    for (const [breakpoint, elements] of breakpoints) {
      if (actualContainerWidth < parseInt(breakpoint)) {
        finalElements = elements;
        break;
      }
    }

    this.setState({
      elementWidth: actualContainer.clientWidth / finalElements,
    });
  };

  componentDidMount = () => {
    this.resizeHandler(); // Compute the initial width
    // We'll use a shared observer for MangaCards since
    // there can be potentially many of them.
    observer.observe(this.ref.current);
    if (this.props.saved) {
      this.setState({
        saved: this.props.saved,
        saving: false,
      });
    } else {
      globalHistoryHandler
        .isSeriesPinned(this.props.slug, this.props.sourceName)
        .then((saved) => {
          if (this.ref.current) {
            this.setState({
              saved,
              saving: false,
            });
          }
        });
    }
    window.addEventListener("resize", this.resizeHandler);
  };

  componentWillUnmount = () => {
    observer.unobserve(this.ref.current);
    window.removeEventListener("resize", this.resizeHandler);
  };

  render() {
    return (
      <Transition
        appear={true}
        show={true}
        as={Fragment}
        enter="transition-opacity duration-1000"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-1000"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={this.state.elementWidth === 0 ? "" : "aspect-[1/1.4]"}
          style={{
            willChange: "transform",
            width: `${this.state.elementWidth}px`,
          }}
        >
          <div className="p-1.5 md:p-3 w-full h-full">
            <a
              ref={this.ref}
              href={this.props.mangaUrlizer(this.props.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className={classNames(
                "bg-no-repeat bg-cover bg-center bg-gray-300 dark:bg-gray-800",
                "transform rounded-lg shadow-md scale-100 md:hover:scale-105",
                "flex flex-row flex-wrap p-1 transition duration-100 ease-in-out",
                "w-full h-full"
              )}
              data-background-image={`linear-gradient(rgba(0,0,0,0) 60%, rgba(0,0,0,0.75) 90%), url("${this.props.coverUrl}")`}
              onClick={this.addHistoryHandler}
              style={{ willChange: "transform" }}
            >
              <div className="w-full h-full px-0 flex flex-row flex-wrap overflow-hidden">
                <div className="w-full text-gray-700 font-semibold relative pt-3 md:pt-0">
                  <div
                    className="text-xs sm:text-base text-white absolute bottom-0 left-0 mx-1 mb-1"
                    style={{
                      textShadow:
                        "0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black",
                    }}
                  >
                    {this.props.mangaTitle}
                  </div>
                  <div
                    className={classNames(
                      this.props.showRemoveFromHistory
                        ? "text-gray-400 dark:text-gray-600"
                        : "hidden",
                      "absolute top-0 left-0 mx-1 my-1 bg-gray-900 dark:bg-white rounded-full p-1 shadow-xl transform scale-95 transition-opacity transition-transform duration-250",
                      this.state.removing
                        ? "opacity-100 hover:scale-95"
                        : "opacity-40 hover:scale-105 hover:opacity-100"
                    )}
                    onClick={this.removeHistoryHandler}
                    style={{ willChange: "transform" }}
                  >
                    {this.state.removing ? (
                      <SpinIcon className="rounded-full animate-spin z-10 p-0 w-6 h-6" />
                    ) : (
                      <XIcon className="rounded-full z-10 p-0 w-6 h-6" />
                    )}
                  </div>
                  <div
                    className={classNames(
                      this.state.saved
                        ? "opacity-80 text-red-700 dark:text-red-600"
                        : "text-gray-400 dark:text-gray-600",
                      "absolute top-0 right-0 mx-1 my-1 bg-gray-900 dark:bg-white rounded-full p-1 shadow-xl transform scale-95 transition-opacity transition-transform duration-250",
                      this.state.saving
                        ? "opacity-100 hover:scale-95"
                        : "opacity-40 hover:scale-105 hover:opacity-100"
                    )}
                    onClick={this.pinHandler}
                    style={{ willChange: "transform" }}
                  >
                    {this.state.saving ? (
                      <SpinIcon className="rounded-full animate-spin z-10 p-0 w-6 h-6" />
                    ) : (
                      <HeartIcon className="rounded-full z-10 p-0 w-6 h-6" />
                    )}
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </Transition>
    );
  }
}
