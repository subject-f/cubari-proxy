import {
  createRequestObject,
  createHomeSection,
  createHomeSectionRequest,
  createIconText,
  createMangaTile,
} from "../utils/bridge.js";
import cheerio from "cheerio";

const NHENTAI_DOMAIN = "https://nhentai.net";

export default class NHentai {
  searchRequest(query, page) {
    // If h-sources are disabled for the search request, always return null
    if (query.hStatus === false) {
      return null;
    }

    // If the search query is a six digit direct link to a manga, create a request to just that URL and alert the handler via metadata
    if (query.title?.match(/\d{5,6}/)) {
      return createRequestObject({
        url: `${NHENTAI_DOMAIN}/g/${query.title}`,
        metadata: { sixDigit: true },
        timeout: 4000,
        method: "GET",
      });
    }

    // Concat all of the available options together into a search keyword which can be supplied as a GET request param
    let param = "";
    if (query.title) {
      param += query.title.replace(" ", "+") + "+";
    }
    if (query.includeContent) {
      for (let content in query.includeContent) {
        param +=
          'tag:"' + query.includeContent[content].replace(" ", "+") + '"+';
      }
    }
    if (query.excludeContent) {
      for (let content in query.excludeContent) {
        param +=
          '-tag:"' + query.excludeContent[content].replace(" ", "+") + '"+';
      }
    }

    if (query.artist) {
      param += "Artist:" + query.artist.replace(" ", "+") + "+";
    }

    param = param.trim();
    param = encodeURI(param);

    return createRequestObject({
      url: `${NHENTAI_DOMAIN}/search/?q=${param}&page=${page}`,
      metadata: { sixDigit: false },
      timeout: 4000,
      method: "GET",
    });
  }

  search(data, metadata) {
    let $ = cheerio.load(data);
    let mangaTiles = [];

    // Was this a six digit request?
    if (metadata.sixDigit) {
      // Retrieve the ID from the body
      let contextNode = $("#bigcontainer");
      let href = $("a", contextNode).attr("href");

      let mangaId = parseInt(href?.match(/g\/(\d*)\/\d/)[1]);

      let title = $("[itemprop=name]").attr("content") ?? "";

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      title = title.replace(/(\[.+?\])/g, "").trim();

      mangaTiles.push(
        createMangaTile({
          id: mangaId.toString(),
          title: createIconText({ text: title }),
          image: $("[itemprop=image]").attr("content") ?? "",
        })
      );
      return mangaTiles;
    }

    let containerNode = $(".index-container");
    for (let item of $(".gallery", containerNode).toArray()) {
      let currNode = $(item);
      let image = $("img", currNode).attr("data-src");

      // If image is undefined, we've hit a lazyload part of the website. Adjust the scraping to target the other features
      if (image === undefined) {
        image = "http:" + $("img", currNode).attr("src");
      }

      let title = $(".caption", currNode).text();
      let idHref = $("a", currNode)
        .attr("href")
        ?.match(/\/(\d*)\//);

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      title = title.replace(/(\[.+?\])/g, "").trim();

      mangaTiles.push(
        createMangaTile({
          id: idHref[1],
          title: createIconText({ text: title }),
          image: image,
        })
      );
    }

    return mangaTiles;
  }

  getHomePageSectionRequest() {
    let request = createRequestObject({
      url: `${NHENTAI_DOMAIN}`,
      method: "GET",
    });
    let homeSection = createHomeSection({
      id: "latest_hentai",
      title: "LATEST HENTAI",
      view_more: true,
    });
    return [
      createHomeSectionRequest({ request: request, sections: [homeSection] }),
    ];
  }

  getHomePageSections(data, section) {
    let updatedHentai = [];
    let $ = cheerio.load(data);

    let containerNode = $(".index-container");
    for (let item of $(".gallery", containerNode).toArray()) {
      let currNode = $(item);
      let image = $("img", currNode).attr("data-src");

      // If image is undefined, we've hit a lazyload part of the website. Adjust the scraping to target the other features
      if (image === undefined) {
        image = "http:" + $("img", currNode).attr("src");
      }

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      let title = $(".caption", currNode).text();
      title = title.replace(/(\[.+?\])/g, "").trim();

      let idHref = $("a", currNode)
        .attr("href")
        ?.match(/\/(\d*)\//);

      updatedHentai.push(
        createMangaTile({
          id: idHref[1],
          title: createIconText({ text: title }),
          image: image,
        })
      );
    }

    section[0].items = updatedHentai;
    return section;
  }

  getMangaUrl(slug) {
    return `https://guya.moe/g/${slug}/`;
  }
}
