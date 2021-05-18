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
      searching: false,
    };
    this.inputRef = React.createRef();
    this.runningQueries = new Set();
  }

  handleInput = (event) => {
    if (event.key === "Enter" && event.target.value) {
      let query = {
        title: event.target.value,
      };
      this.props.searchHandler("", {});
      this.setState(
        {
          searching: true,
        },
        () => {
          this.runSearchQuery(query);
        }
      );
    }
  };

  runSearchQuery = (query) => {
    Object.entries(this.props.sources).forEach(([sourceName, source]) => {
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
            manga.source = source;
            manga.sourceName = sourceName;
            return manga;
          });
          this.props.searchHandler(query.title, {
            ...this.props.searchResults,
            [sourceName]: results,
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
    this.inputRef.current.focus();
  };

  render() {
    const items = [];
    Object.entries(this.props.searchResults).forEach(([source, results]) => {
      if (results && results.length) {
        items.push(
          <Section
            key={`search-${source}`}
            text={source}
            subText={
              (recommendedSources.includes(source) ? "Recommended - " : "") +
              `${results.length} result(s)`
            }
          />
        );
        items.push(
          <ScrollableCarousel key={`search-${source}-carousel`}>
            {results.map((item) => (
              <MangaCard
                key={"search-" + source.name + item.id}
                mangaUrlizer={item.mangaUrlizer}
                slug={item.slug}
                coverUrl={item.coverUrl}
                mangaTitle={item.mangaTitle}
                sourceName={item.sourceName}
                source={item.source}
              />
            ))}
          </ScrollableCarousel>
        );
      }
    });

    return (
      <Container>
        <input
          className="w-full mt-8 p-4 pt-4 pb-4 text-2xl text-black bg-gray-200 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none shadow-md"
          ref={this.inputRef}
          onKeyPress={this.handleInput}
          type="text"
          defaultValue={this.props.searchQuery}
          placeholder="Search..."
        />
        {items.length ? <Container>{items}</Container> : undefined}
        {this.state.searching ? (
          <Spinner />
        ) : items.length ? undefined : this.props.searchQuery ? (
          <Section
            key="results"
            text="No results."
            subText="Sorry 'bout that."
          />
        ) : undefined}
      </Container>
    );
  }
}
