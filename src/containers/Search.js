import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import Spinner from "../components/Spinner";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";
import Container from "../components/Container";

const recommendedSources = ["MangaKatana", "Manga4Life", "Guya"];

export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searching: undefined,
      results: {},
    };
    this.runningQueries = new Set();
  }

  handleInput = (event) => {
    if (event.key === "Enter") {
      let query = {
        title: event.target.value,
      };
      this.setState(
        {
          searching: true,
          results: {},
        },
        () => {
          this.runSearchQuery(query);
        }
      );
    }
  };

  runSearchQuery = (query) => {
    this.props.sources.forEach((source) => {
      const queryTask = {
        source,
        query,
      };
      this.runningQueries.add(queryTask);
      let baseReq = source.searchRequest(query);
      baseReq
        .then((e) => {
          let results = (e.results || []).map((manga) => {
            manga.mangaUrlizer = source.getMangaUrl;
            manga.slug = manga.id;
            manga.coverUrl = manga.image;
            manga.mangaTitle = manga.title.text;
            return manga;
          });
          this.setState({
            results: {
              [source.getSourceDetails().name]: results,
              ...this.state.results,
            },
          });
        })
        .finally(() => {
          this.runningQueries.delete(queryTask);
          this.setState({
            searching: this.runningQueries.size ? true : false,
          });
        });
    });
  };

  componentDidMount = () => {
    this.props.setPath("Search");
  };

  render() {
    const items = [];
    Object.entries(this.state.results).forEach((entry) => {
      let source = entry[0];
      let results = entry[1];
      if (results && results.length) {
        items.push(
          <Section
            key={`search-${source}`}
            text={source}
            subText={
              recommendedSources.includes(source) ? "Recommended" : undefined
            }
          />
        );
        items.push(
          <ScrollableCarousel key={`search-${source}-carousel`}>
            {results.map((item) => (
              <MangaCard
                key={"Search-" + source.name + item.id}
                mangaUrlizer={item.mangaUrlizer}
                slug={item.id}
                coverUrl={item.image}
                mangaTitle={item.title.text}
              />
            ))}
          </ScrollableCarousel>
        );
      }
    });

    return (
      <Container>
        <input
          className="w-full mt-8 p-4 pt-4 pb-4 text-2xl text-black bg-gray-200 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none"
          onKeyPress={this.handleInput}
          type="text"
          placeholder="Search..."
        />
        {this.state.searching ? (
          <Spinner />
        ) : this.state.searching ===
          undefined ? undefined : items.length ? undefined : (
          <Section key="results" text="No results." subText="Sorry 'bout that." />
        )}
        <Container>{items}</Container>
      </Container>
    );
  }
}
