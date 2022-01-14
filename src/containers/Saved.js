import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import Container from "../components/Container";
import Section from "../components/Section";
import {
  globalHistoryHandler,
  purgePreviousCache,
} from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import { sourceMap } from "../sources/Sources";
import { mangaUrlBuilder } from "../utils/compatability";
import ScrollableCarousel from "../components/ScrollableCarousel";

export default class Saved extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      items: [],
      ready: false,
    };
  }

  updateItems = () => {
    return globalHistoryHandler.getAllPinnedSeries().then((items) => {
      if (this.ref.current) {
        this.setState({
          items,
          ready: true,
        });
      }
    });
  };

  componentDidMount = () => {
    this.props.setPath("Saved");
    purgePreviousCache();
    this.updateItems();
  };

  render() {
    return (
      <Container>
        <Section
          text="Saved"
          subText={'This includes stuff you\'ve "hearted"'}
          ref={this.ref}
        ></Section>
        {this.state.ready ? (
          <ScrollableCarousel expandable={true} expanded={true}>
            {this.state.items.map((e) => (
              <MangaCard
                key={`saved-${e.timestamp}-${e.slug}-${e.source}`}
                mangaUrlizer={mangaUrlBuilder(e.url)}
                slug={e.slug}
                coverUrl={e.coverUrl}
                mangaTitle={e.title}
                sourceName={e.source}
                source={sourceMap[e.source]}
                storageCallback={this.updateItems}
              ></MangaCard>
            ))}
          </ScrollableCarousel>
        ) : (
          <Spinner />
        )}
      </Container>
    );
  }
}
