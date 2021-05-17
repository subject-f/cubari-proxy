import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";
import Spinner from "../components/Spinner";
import Container from "../components/Container";
import { capitalizeFirstLetters } from "../utils/strings";

export default class Discover extends PureComponent {
  componentDidMount = () => {
    this.props.setPath("Discover");
  };

  render() {
    const items = [];
    this.props.discover.forEach((section) => {
      if (section.items && section.items.length) {
        let [text, subText] = section.title.split(" - ");
        items.push(
          <Section
            key={section.id + section.title + "title"}
            text={text}
            subText={capitalizeFirstLetters(subText)}
          />
        );
        items.push(
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
        );
      }
    });
    return (
      <Container>{this.props.discover.size ? items : <Spinner />}</Container>
    );
  }
}
