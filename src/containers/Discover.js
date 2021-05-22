import React, { Fragment, PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";
import Spinner from "../components/Spinner";
import Container from "../components/Container";
import Tabber from "../components/Tabber";
import { capitalizeFirstLetters } from "../utils/strings";
import sourcemap from "../sources/sourcemap.js";

export default class Discover extends PureComponent {
  componentDidMount = () => {
    this.props.setPath("Discover");
  };

  getSourceNamesAndIcons() {
    let activeSources = new Set(
      [...this.props.discover].map((section) => section.sourceName)
    );
    let response = [];
    for (const [sourceName, source] of Object.entries(sourcemap)) {
      let iconFileName = source.getSourceDetails().icon;
      response.push({
        name: sourceName,
        icon: require(`../sources/${sourceName}/includes/${iconFileName}`),
        disabled: !activeSources.has(sourceName),
      });
    }
    return response;
  }

  render() {
    const items = [];
    this.props.discover.forEach((section) => {
      if (section.items && section.items.length) {
        let subText = section.title.split(" - ")[1];
        items.push(
          <Fragment
            key={section.sourceName + section.id + section.title + "-section"}
          >
            <Section
              key={section.id + section.title + "title"}
              text={capitalizeFirstLetters(subText)}
            />
            <ScrollableCarousel key={section.id + section.title + "-carousel"}>
              {section.items.map((item) => (
                <MangaCard
                  key={section.id + item.id}
                  mangaUrlizer={section.mangaUrlizer}
                  slug={item.id}
                  coverUrl={item.image}
                  mangaTitle={item.title.text}
                  sourceName={section.sourceName}
                  source={section.source}
                />
              ))}
            </ScrollableCarousel>
          </Fragment>
        );
      }
    });
    return (
      <Container>
        {this.props.discover.size ? (
          <Tabber items={items} classes={this.getSourceNamesAndIcons()} />
        ) : (
          <Spinner />
        )}
      </Container>
    );
  }
}
