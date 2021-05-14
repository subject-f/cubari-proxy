import React, { PureComponent } from "react";
import observer from "../utils/observer";
import { insert } from "../utils/history";

export default class MangaCard extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  saveToHistory = (e) => {
    if (e.button === 0 || e.button === 1) {
      insert(
        this.props.mangaUrlizer(this.props.slug),
        this.props.mangaTitle,
        this.props.mangaUrlizer(this.props.slug),
        this.props.coverUrl
      );
    }
  };

  componentDidMount = () => {
    observer.observe(this.ref.current);
  };

  render() {
    return (
      <div className="px-3">
        <a
          ref={this.ref}
          href={this.props.mangaUrlizer(this.props.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-no-repeat bg-cover bg-center bg-gray-300 dark:bg-gray-800 transform rounded-lg shadow-md scale-100 hover:scale-105 h-72 w-48 flex flex-row flex-wrap p-1 transition duration-100 ease-in-out"
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
            </div>
          </div>
        </a>
      </div>
    );
  }
}
