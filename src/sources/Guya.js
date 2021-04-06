import {
  createRequestObject,
  createHomeSection,
  createHomeSectionRequest,
  createIconText,
  createMangaTile,
} from "../utils/bridge.js";

const GUYA_API_BASE = "https://cubari.moe";
const GUYA_ALL_SERIES_API = `${GUYA_API_BASE}/api/get_all_series/`;

export default class Guya {
  getHomePageSectionRequest() {
    return [
      createHomeSectionRequest({
        request: createRequestObject({
          url: GUYA_ALL_SERIES_API,
          method: "GET",
        }),
        sections: [createHomeSection({ id: "all_cubari", title: "ALL GUYA" })],
      }),
    ];
  }

  getHomePageSections(data, sections) {
    let result = typeof data === "string" ? JSON.parse(data) : data;

    return sections.map((section) => {
      let mangas = [];
      for (let series in result) {
        let seriesDetails = result[series];
        mangas.push(
          createMangaTile({
            id: seriesDetails["slug"],
            image: `${GUYA_API_BASE}/${seriesDetails["cover"]}`,
            title: createIconText({ text: series }),
          })
        );
      }
      section.items = mangas;
      return section;
    });
  }

  searchRequest(query, page) {
    return createRequestObject({
      metadata: { query: query.title },
      url: GUYA_ALL_SERIES_API,
      method: "GET",
    });
  }

  search(data, metadata) {
    let result = typeof data === "string" ? JSON.parse(data) : data;
    let query = metadata["query"].toLowerCase();

    let filteredResults = Object.keys(result).filter((e) =>
      e.toLowerCase().includes(query)
    );

    return filteredResults.map((series) => {
      let seriesMetadata = result[series];
      return createMangaTile({
        id: seriesMetadata["slug"],
        image: `${GUYA_API_BASE}/${seriesMetadata["cover"]}`,
        title: createIconText({ text: series }),
      });
    });
  }

  getMangaUrl(slug) {
    return `https://cubari.moe/read/manga/${slug}/`;
  }

  getSourceName() {
    return "Guya";
  }
}
