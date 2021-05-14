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
      <a
        ref={this.ref}
        href={this.props.mangaUrlizer(this.props.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className="lazy-background bg-no-repeat bg-cover bg-center transform rounded-lg hover:shadow-lg shadow-md scale-95 hover:scale-100 h-80 w-52 bg-gray-600 flex flex-row flex-wrap p-2 transition duration-250 ease-in-out"
        data-background-image={`linear-gradient(rgba(0,0,0,0) 50%, black 95%), url("${this.props.coverUrl}")`}
        onMouseDown={this.saveToHistory}
      >
        <div className="w-full px-0 flex flex-row flex-wrap overflow-hidden">
          <div className="w-full text-gray-700 font-semibold relative pt-3 md:pt-0">
            <div
              className="text-l text-white absolute bottom-0 left-0"
              style={{
                textShadow:
                  "0 0 8px black, 0 0 8px black, 0 0 8px black, 0 0 8px black",
              }}
            >
              {this.props.mangaTitle}
            </div>
          </div>
        </div>
      </a>
    );
  }
}
