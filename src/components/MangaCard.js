import React, { PureComponent } from "react";
import observer from "../utils/observer";

const MAX_DESC_LENGTH = 128;

export default class MangaCard extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  trimDescription = (desc) => {
    if (desc) {
      return (
        desc.slice(0, MAX_DESC_LENGTH) +
        (desc.length > MAX_DESC_LENGTH ? "..." : "")
      );
    } else {
      return "";
    }
  };

  componentDidMount = () => {
    observer.observe(this.ref.current);
  };

  render() {
    return (
      <div className="column is-6-mobile is-3-tablet is-2-desktop" ref={this.ref}>
        <div className="manga card">
          <div className="manga card-image">
            <a href={this.props.mangaUrlizer(this.props.slug)}>
              <figure className="image">
                <img data-src={this.props.coverUrl} />
              </figure>
            </a>
          </div>
          <div className="manga card-content">
            <div className="media">
              <div className="media-content">
                <p className="title is-5">
                  <a href={this.props.mangaUrlizer(this.props.slug)}>
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
