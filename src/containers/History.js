import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import Container from "../components/Container";
import Section from "../components/Section";
import {
  globalHistoryHandler,
  purgePreviousCache,
} from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import sourcemap from "../sources/sourcemap";
import { mangaUrlBuilder } from "../utils/compatability";
import ScrollableCarousel from "../components/ScrollableCarousel";

export default class History extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      items: [],
      ready: false,
    };
  }

  updateItems = () => {
    return globalHistoryHandler.getAllUnpinnedSeries().then((items) => {
      if (this.ref.current) {
        this.setState({
          items,
          ready: true,
        });
      }
    });
  };

  componentDidMount = () => {
    this.props.setPath("History");
    purgePreviousCache();
    this.updateItems();
  };

  render() {
    return (
      <Container>
        <Section
          text="History"
          subText={`This includes the last ${globalHistoryHandler.max} things you've clicked on (${this.state.items.length} so far)`}
          ref={this.ref}
        ></Section>
        {this.state.ready ? (
          <ScrollableCarousel expandable={true} expanded={true}>
            {this.state.items.map((e) => (
              <MangaCard
                key={`history-${e.timestamp}-${e.slug}-${e.source}`}
                mangaUrlizer={mangaUrlBuilder(e.url)}
                slug={e.slug}
                coverUrl={e.coverUrl}
                mangaTitle={e.title}
                sourceName={e.source}
                source={sourcemap[e.source]}
                showRemoveFromHistory={true}
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
