import React, { Fragment, PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import ViewMorePlaceholder from "../components/ViewMorePlaceholder";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";
import Spinner, { SpinIcon } from "../components/Spinner";
import Container from "../components/Container";
import { capitalizeFirstLetters } from "../utils/strings";
import { sourceMap } from "../sources/Sources";
import { RadioGroup } from "@headlessui/react";
import { classNames } from "../utils/strings";
import EndPlaceholder from "../components/EndPlaceholder";

export default class Discover extends PureComponent {
  state = {
    currentSource: Object.keys(sourceMap)[0],
  };

  componentDidMount = () => {
    this.props.setPath("Discover");
  };

  getSourceNamesAndIcons() {
    let activeSources = new Set(
      Object.values(this.props.discover).map((section) => section.sourceName)
    );
    let response = [];
    for (const [sourceName, source] of Object.entries(sourceMap)) {
      let sourceDetails = source.getSourceDetails();
      response.push({
        name: sourceName,
        icon: `${sourceDetails.remoteBaseUrl}/includes/${sourceDetails.icon}`,
        disabled: !activeSources.has(sourceName),
      });
    }
    return response;
  }

  setCurrentSource = (source) => {
    this.setState({
      currentSource: source,
    });
  };

  render() {
    const items = [];
    Object.values(this.props.discover).forEach((section) => {
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
            <ScrollableCarousel
              key={section.id + section.title + "-carousel"}
              expandable={true}
            >
              {section.items.map((item, idx) => (
                <MangaCard
                  key={`${section.sourceName}-${section.id}-${item.id}-${idx}`}
                  mangaUrlizer={section.mangaUrlizer}
                  slug={item.mangaId || item.id} // item.id exists on 0.6
                  coverUrl={item.image}
                  mangaTitle={item.title.text || item.title} // item.title.text exists on 0.6
                  sourceName={section.sourceName}
                  source={section.source}
                />
              ))}
              {
                // section.view_more exists on 0.6
              }
              {(section.containsMoreItems || section.view_more) &&
              section.metadata &&
              section.hasMore ? (
                <ViewMorePlaceholder
                  onClickHandler={() => section.viewMoreHandler(section)}
                  hasMore={section.hasMore}
                  key={`view-more-${section.sourceName}-${section.id}-${section.items.length}`}
                />
              ) : (
                <EndPlaceholder />
              )}
            </ScrollableCarousel>
          </Fragment>
        );
      }
    });

    return (
      <Container>
        {Object.entries(this.props.discover).length ? (
          <Fragment>
            <ScrollableCarousel iconSize={4}>
              <RadioGroup
                as="div"
                className="py-2 flex flex-nowrap"
                value={this.state.currentSource}
                onChange={this.setCurrentSource}
              >
                {this.getSourceNamesAndIcons().map((source) => (
                  <RadioGroup.Option
                    as={Fragment}
                    value={source.name}
                    key={source.name}
                  >
                    {({ checked }) => (
                      <button
                        disabled={source.disabled}
                        className={classNames(
                          checked
                            ? "bg-black text-white dark:bg-gray-800 dark:text-white"
                            : "bg-transparent text-black dark:text-gray-300",
                          source.disabled
                            ? "opacity-25"
                            : checked
                            ? ""
                            : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white",
                          "min-w-max inline-flex items-center justify-center px-3 py-2 mx-2 rounded-md text-md font-medium focus:outline-none"
                        )}
                      >
                        {source.disabled ? (
                          <SpinIcon className="h-8 h-8 animate-spin"></SpinIcon>
                        ) : (
                          <img
                            src={source.icon}
                            className="h-8 w-8"
                            alt={source.name}
                          />
                        )}
                        <div className="block px-2">{source.name}</div>
                      </button>
                    )}
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
            </ScrollableCarousel>

            {items.map((item) =>
              item.key.includes(this.state.currentSource) ? item : undefined
            )}
          </Fragment>
        ) : (
          <Spinner />
        )}
      </Container>
    );
  }
}
