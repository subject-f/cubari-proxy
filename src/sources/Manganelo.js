import {
  createRequestObject,
  createHomeSection,
  createHomeSectionRequest,
  createIconText,
  createMangaTile,
} from "../utils/bridge.js";
import cheerio from "cheerio";

const MN_DOMAIN = "https://manganelo.com";

export default class Manganelo {
  getHomePageSectionRequest() {
    let request = createRequestObject({ url: `${MN_DOMAIN}`, method: "GET" });
    let section1 = createHomeSection({
      id: "top_week",
      title: "TOP OF THE WEEK",
    });
    let section2 = createHomeSection({
      id: "latest_updates",
      title: "LATEST UPDATES",
    });
    let section3 = createHomeSection({ id: "new_manga", title: "NEW MANGA" });
    return [
      createHomeSectionRequest({
        request: request,
        sections: [section1, section2, section3],
      }),
    ];
  }

  getHomePageSections(data, sections) {
    let $ = cheerio.load(data);
    let topManga = [];
    let updateManga = [];
    let newManga = [];

    for (let item of $(".item", ".owl-carousel").toArray()) {
      let id = $("a", item).first().attr("href")?.split("/").pop() || "";
      let image = $("img", item).attr("src") || "";
      topManga.push(
        createMangaTile({
          id: id,
          image: image,
          title: createIconText({ text: $("a", item).first().text() }),
          subtitleText: createIconText({
            text: $("[rel=nofollow]", item).text(),
          }),
        })
      );
    }

    for (let item of $(
      ".content-homepage-item",
      ".panel-content-homepage"
    ).toArray()) {
      let id = $("a", item).first().attr("href")?.split("/").pop() || "";
      let image = $("img", item).attr("src") || "";
      let itemRight = $(".content-homepage-item-right", item);
      let latestUpdate = $(".item-chapter", itemRight).first();
      updateManga.push(
        createMangaTile({
          id: id,
          image: image,
          title: createIconText({ text: $("a", itemRight).first().text() }),
          subtitleText: createIconText({
            text: $(".item-author", itemRight).text(),
          }),
          primaryText: createIconText({
            text: $(".genres-item-rate", item).text(),
            icon: "star.fill",
          }),
          secondaryText: createIconText({
            text: $("i", latestUpdate).text(),
            icon: "clock.fill",
          }),
        })
      );
    }

    for (let item of $("a", ".panel-newest-content").toArray()) {
      let id = $(item).attr("href")?.split("/").pop() || "";
      let image = $("img", item).attr("src") || "";
      let title = $("img", item).attr("alt") || "";
      newManga.push(
        createMangaTile({
          id: id,
          image: image,
          title: createIconText({ text: title }),
        })
      );
    }

    sections[0].items = topManga;
    sections[1].items = updateManga;
    sections[2].items = newManga;
    return sections;
  }

  searchRequest(query, page) {
    let genres = (query.includeGenre || [])
      .concat(query.includeDemographic || [])
      .join("_");
    let excluded = (query.excludeGenre || [])
      .concat(query.excludeDemographic || [])
      .join("_");
    let status = "";
    switch (query.status) {
      case 0:
        status = "completed";
        break;
      case 1:
        status = "ongoing";
        break;
      default:
        status = "";
    }

    let keyword = (query.title || "").replace(/ /g, "_");
    if (query.author) keyword += (query.author || "").replace(/ /g, "_");
    let search = `s=all&keyw=${keyword}`;
    search += `&g_i=${genres}&g_e=${excluded}&page=${page}`;
    if (status) {
      search += `&sts=${status}`;
    }

    let metadata = { search: search };
    return createRequestObject({
      url: `${MN_DOMAIN}/advanced_search?${search}`,
      method: "GET",
      metadata: metadata,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      param: `${search}`,
    });
  }

  search(data, metadata) {
    let $ = cheerio.load(data);
    let panel = $(".panel-content-genres");
    let manga = [];
    for (let item of $(".content-genres-item", panel).toArray()) {
      let id =
        $(".genres-item-name", item).attr("href")?.split("/").pop() || "";
      let title = $(".genres-item-name", item).text();
      let subTitle = $(".genres-item-chap", item).text();
      let image = $(".img-loading", item).attr("src") || "";
      let rating = $(".genres-item-rate", item).text();
      let updated = $(".genres-item-time", item).text();

      manga.push(
        createMangaTile({
          id: id,
          image: image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: subTitle }),
          primaryText: createIconText({ text: rating, icon: "star.fill" }),
          secondaryText: createIconText({ text: updated, icon: "clock.fill" }),
        })
      );
    }

    return manga;
  }

  getMangaUrl(slug) {
    return `https://guya.moe/mb/https://manganelo.com/manga/${slug}/`;
  }

  getSourceName() {
    return "Manganelo";
  }
}
