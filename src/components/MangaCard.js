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
      <div
        className="column is-6-mobile is-3-tablet is-2-desktop"
        ref={this.ref}
      >
        <div className="manga card">
          <div className="manga card-image">
            <a
              href={this.props.mangaUrlizer(this.props.slug)}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={this.saveToHistory}
            >
              <figure className="image">
                <img data-src={this.props.coverUrl} alt={this.props.slug} />
              </figure>
            </a>
          </div>
          <div className="manga card-content">
            <div className="media">
              <div className="media-content">
                <p className="title is-5">
                  <a
                    href={this.props.mangaUrlizer(this.props.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseDown={this.saveToHistory}
                  >
                    {this.props.mangaTitle}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
