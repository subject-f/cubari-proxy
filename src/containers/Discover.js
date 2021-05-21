import React, { Fragment, PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";
import Spinner from "../components/Spinner";
import Container from "../components/Container";
import Tabber from "../components/Tabber";
import { capitalizeFirstLetters } from "../utils/strings";

export default class Discover extends PureComponent {
  componentDidMount = () => {
    this.props.setPath("Discover");
  };

  getSourceNamesAndIcon() {
    let sourceNames = new Set();
    const response = [...this.props.discover].reduce((acc, section) => {
      if (
        sourceNames.has(section.sourceName) ||
        !(section.items && section.items.length)
      )
        return acc;
      sourceNames.add(section.sourceName);
      let iconFileName = section.source.getSourceDetails().icon;
      acc.push({
        name: section.sourceName,
        icon: require(`../sources/${section.sourceName}/includes/${iconFileName}`),
      });
      return acc;
    }, []);
    return response;
  }

  render() {
    const items = [];
    this.props.discover.forEach((section) => {
      if (section.items && section.items.length) {
        let [text, subText] = section.title.split(" - ");
        items.push(
          <Fragment
            key={section.sourceName + section.id + section.title + "-section"}
          >
            <Section
              key={section.id + section.title + "title"}
              text={text}
              subText={capitalizeFirstLetters(subText)}
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
          <Tabber items={items} classes={this.getSourceNamesAndIcon()} />
        ) : (
          <Spinner />
        )}
      </Container>
    );
  }
}
