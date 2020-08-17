import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";

export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searching: false,
      results: new Set(),
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
          results: new Set(),
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
      baseReq()
        .then((e) => e.text())
        .then((e) => {
          let results = source.search(e, baseReq.metadata).map((manga) => {
            manga.mangaUrlizer = source.getMangaUrl;
            return manga;
          });
          this.runningQueries.delete(queryTask);
          this.setState({
            results: new Set([...this.state.results, ...results]),
            searching: this.runningQueries.size ? true : false,
          });
        });
    });
  };

  render() {
    const items = [];
    this.state.results.forEach((manga) =>
      items.push(
        <MangaCard
          key={manga.slug}
          mangaUrlizer={manga.mangaUrlizer}
          slug={manga.slug}
          coverUrl={manga.coverUrl}
          mangaTitle={manga.mangaTitle}
        />
      )
    );
    return (
      <div className="columns is-mobile is-multiline">
        <section className="hero column is-full">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Search</h1>
              <h2 className="subtitle">
                Press enter after your query to search.
              </h2>
            </div>
          </div>
          <input
            className="input is-medium"
            onKeyPress={this.handleInput}
            type="text"
            placeholder="Search..."
          />
        </section>
        {items}
        {this.state.searching ? (
          <progress className="progress is-small"></progress>
        ) : undefined}
      </div>
    );
  }
}
