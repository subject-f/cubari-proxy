import React, { PureComponent } from "react";
import { getAll } from "../utils/history";
import MangaCard from "../components/MangaCard";
import Container from "../components/Container";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";

export default class History extends PureComponent {
  componentDidMount = () => {
    this.props.setPath("History");
  };

  render() {
    const items = getAll().map((manga) => (
      <MangaCard
        key={manga.identifier}
        mangaUrlizer={(e) => e}
        slug={manga.identifier}
        coverUrl={manga.coverUrl}
        mangaTitle={manga.title}
      />
    ));

    return (
      <Container>
        <Section
          text="History"
          subText="This includes stuff you've clicked on"
        ></Section>
        <ScrollableCarousel key="history">{items}</ScrollableCarousel>
      </Container>
    );
  }
}
