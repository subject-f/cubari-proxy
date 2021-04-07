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
      <div className="UI HistoryUnit" ref={this.ref}>
        <a
          className="manga-card smol proxy"
          href={this.props.mangaUrlizer(this.props.slug)}
          target="_blank"
          rel="noopener noreferrer"
          onMouseDown={this.saveToHistory}
        >
          <div
            className="bloor"
            style={{ backgroundImage: `url("${this.props.coverUrl}")` }}
          ></div>
          <picture>
            <img data-src={this.props.coverUrl} alt={this.props.mangaTitle}></img>
          </picture>
          <article>
            <h2>
              <span className="title">{this.props.mangaTitle}</span>
            </h2>
          </article>
        </a>
      </div>
    );
  }
}
