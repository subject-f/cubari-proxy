import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import { capitalizeFirstLetters } from "../utils/strings.js";

export default class Discover extends PureComponent {
  createHeroSection = (section) => {
    return (
      <section key={section.id} className="hero column is-full">
        <h1 className="title is-4">{capitalizeFirstLetters(section.title)}</h1>
      </section>
    );
  };

  render() {
    const items = [];
    this.props.discover.forEach((section) => {
      items.push(this.createHeroSection(section));
      section.items.forEach((item) => {
        items.push(
          <MangaCard
            key={section.id + item.slug}
            mangaUrlizer={section.mangaUrlizer}
            slug={item.slug}
            coverUrl={item.coverUrl}
            mangaTitle={item.mangaTitle}
          />
        );
      });
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
          <progress className="progress is-small is-dark"></progress>
        )}
      </div>
    );
  }
}
