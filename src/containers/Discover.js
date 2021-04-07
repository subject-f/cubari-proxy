import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import { capitalizeFirstLetters } from "../utils/strings.js";

export default class Discover extends PureComponent {
  createHeroSection = (section) => {
    return (
      <section key={section.id + section.title} className="hero column is-full">
        <h1 className="title is-4">{capitalizeFirstLetters(section.title)}</h1>
      </section>
    );
  };

  render() {
    const items = [];
    this.props.discover.forEach((section) => {
      items.push(this.createHeroSection(section));
      if (section.items) {
        section.items.forEach((item) => {
          items.push(
            <MangaCard
              key={section.id + item.id}
              mangaUrlizer={section.mangaUrlizer}
              slug={item.id}
              coverUrl={item.image}
              mangaTitle={item.title.text}
            />
          );
        });
      }
    });
    return (
      <div className="columns is-mobile is-multiline">
        <section className="hero column is-full">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Discover</h1>
              <h2 className="subtitle">Discover your favourites here.</h2>
            </div>
          </div>
        </section>
        {this.props.discover.size ? (
          items
        ) : (
          <progress className="progress is-small"></progress>
        )}
      </div>
    );
  }
}
