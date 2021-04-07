import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import { capitalizeFirstLetters } from "../utils/strings.js";

export default class Discover extends PureComponent {
  createHeroSection = (section) => {
    return (
      <h2 key={section.id + section.title} className="pinned-header">
        {capitalizeFirstLetters(section.title)}
      </h2>
    );
  };

  render() {
    const items = [];
    this.props.discover.forEach((section) => {
      if (section.items) {
        items.push(this.createHeroSection(section));
        let sectionItems = section.items.map((item) => {
          return (
            <MangaCard
              key={section.id + item.id}
              mangaUrlizer={section.mangaUrlizer}
              slug={item.id}
              coverUrl={item.image}
              mangaTitle={item.title.text}
            />
          );
        });
        items.push(
          <div
            key={section.id + section.title + "container"}
            className="history UI List"
          >
            {sectionItems}
          </div>
        );
      }
    });
    return (
      <React.Fragment>
        {this.props.discover.size ? (
          items
        ) : (
          <progress className="progress is-small"></progress>
        )}
      </React.Fragment>
    );
  }
}
