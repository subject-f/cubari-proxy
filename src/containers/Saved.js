import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import Container from "../components/Container";
import Section from "../components/Section";
import { globalHistoryHandler } from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import sourcemap from "../sources/sourcemap";
import { mangaUrlBuilder } from "../utils/compatability";

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
          <Container>
            {this.state.items.map((e) => (
              <MangaCard
                key={`saved-${e.timestamp}-${e.slug}-${e.source}`}
                mangaUrlizer={mangaUrlBuilder(e.url)}
                slug={e.slug}
                coverUrl={e.coverUrl}
                mangaTitle={e.title}
                sourceName={e.source}
                source={sourcemap[e.source]}
                storageCallback={this.updateItems}
              ></MangaCard>
            ))}
          </Container>
        ) : (
          <Spinner />
        )}
      </Container>
    );
  }
}
