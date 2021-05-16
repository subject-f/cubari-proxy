import React, { PureComponent } from "react";
import observer from "../utils/observer";
import { Transition } from "@headlessui/react";
import { HeartIcon } from "@heroicons/react/solid";
import { classNames } from "../utils/strings";

export default class MangaCard extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      saved: undefined,
    };
  }

  saveToHistory = (e) => {
    // TODO remotestorage?
    // if (e.button === 0 || e.button === 1) {
    //   insert(
    //     this.props.sourceName + this.props.slug,
    //     this.props.mangaTitle,
    //     this.props.mangaUrlizer(this.props.slug),
    //     this.props.coverUrl
    //   );
    // }
  };

  save = () => {
    // TODO actually commit the save
    this.setState({
      saved: true,
    });
  };

  unsave = () => {
    // TODO actually commit the unsave
    this.setState({
      saved: false,
    });
  };

  saveHandler = (e) => {
    e.preventDefault();
    if (this.state.saved) {
      this.unsave();
    } else {
      this.save();
    }
    return false;
  };

  componentDidMount = () => {
    // We'll use a shared observer for MangaCards since
    // there can be potentially many of them.
    observer.observe(this.ref.current);
    if (this.props.saved) {
      this.setState({
        saved: this.props.saved,
      });
    } else {
      // Check whether value is saved
      // let saveStatus = saved
      //   .getAll()
      //   .find(
      //     (e) =>
      //       e.source === this.props.sourceName && e.slug === this.props.slug
      //   );
      // this.setState({
      //   saved: saveStatus,
      // });
    }
  };

  componentWillUnmount = () => {
    observer.unobserve(this.ref.current);
  };

  render() {
    return (
      <Transition
        appear={true}
        show={true}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="px-3 py-3">
          <a
            ref={this.ref}
            href={this.props.mangaUrlizer(this.props.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-no-repeat bg-cover bg-center bg-gray-300 dark:bg-gray-800 transform rounded-lg shadow-md scale-100 md:hover:scale-105 h-72 w-48 flex flex-row flex-wrap p-1 transition duration-100 ease-in-out"
            data-background-image={`linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 90%), url("${this.props.coverUrl}")`}
            onMouseDown={this.saveToHistory}
          >
            <div className="w-full h-full px-0 flex flex-row flex-wrap overflow-hidden">
              <div className="w-full text-gray-700 font-semibold relative pt-3 md:pt-0">
                <div
                  className="text-l text-white absolute bottom-0 left-0 mx-1 mb-1"
                  style={{
                    textShadow:
                      "0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black",
                  }}
                >
                  {this.props.mangaTitle}
                </div>
                <div
                  className={classNames(
                    this.state.saved
                      ? "opacity-80 text-red-700 dark:text-red-600"
                      : "text-gray-600 dark:text-gray-400",
                    "absolute top-0 right-0 mx-1 my-1 bg-gray-900 dark:bg-white rounded-full p-1 shadow-xl transform scale-95 hover:scale-105 opacity-50 hover:opacity-100 transition-opacity transition-transform duration-250"
                  )}
                  onClick={this.saveHandler}
                >
                  <HeartIcon className="rounded-full z-10 p-0 w-6 h-6" />
                </div>
              </div>
            </div>
          </a>
        </div>
      </Transition>
    );
  }
}
