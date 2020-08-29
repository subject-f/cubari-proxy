import {
  createRequestObject,
  createHomeSection,
  createHomeSectionRequest,
  createIconText,
  createMangaTile,
  createManga,
} from "../utils/bridge.js";
import cheerio from "cheerio";

const MD_DOMAIN = "https://mangadex.org";
const MD_SEARCH = "https://mangadexapi.appspot.com/search";

export default class MangaDex {
  getHomePageSectionRequest() {
    let request1 = createRequestObject({
      url: MD_DOMAIN,
      method: "GET",
    });
    let request2 = createRequestObject({
      url: `${MD_DOMAIN}/updates`,
      method: "GET",
    });

    let section1 = createHomeSection({
      id: "featured_titles",
      title: "FEATURED TITLES",
    });
    let section2 = createHomeSection({ id: "new_titles", title: "NEW TITLES" });
    let section3 = createHomeSection({
      id: "recently_updated",
      title: "RECENTLY UPDATED TITLES",
    });

    return [
      createHomeSectionRequest({
        request: request1,
        sections: [section1, section2],
      }),
      createHomeSectionRequest({
        request: request2,
        sections: [section3],
      }),
    ];
  }

  getHomePageSections(data, sections) {
    let $ = cheerio.load(data);
    return sections.map((section) => {
      switch (section.id) {
        case "featured_titles":
          section.items = this.parseFeaturedMangaTiles($);
          break;
        case "new_titles":
          section.items = this.parseNewMangaSectionTiles($);
          break;
        case "recently_updated":
          section.items = this.parseRecentlyUpdatedMangaSectionTiles($);
          break;
        default:
          break;
      }

      return section;
    });
  }

  parseFeaturedMangaTiles($) {
    let featuredManga = [];

    $("#hled_titles_owl_carousel .large_logo").each(function (i, elem) {
      let title = $(elem);

      let img = title.find("img").first();
      let links = title.find("a");

      let idStr = links.first().attr("href");
      let id = (idStr || "").match(/(\d+)(?=\/)/) ?? "-1";

      let caption = title.find(".car-caption p:nth-child(2)");
      let bookmarks = caption.find("span[title=Follows]").text();
      let rating = caption.find("span[title=Rating]").text();

      featuredManga.push(
        createMangaTile({
          id: id[0],
          image: img.attr("data-src") ?? "",
          title: createIconText({ text: img.attr("title") ?? "" }),
          primaryText: createIconText({
            text: bookmarks,
            icon: "bookmark.fill",
          }),
          secondaryText: createIconText({ text: rating, icon: "star.fill" }),
        })
      );
    });

    return featuredManga;
  }

  parseNewMangaSectionTiles($) {
    let newManga = [];

    $("#new_titles_owl_carousel .large_logo").each(function (i, elem) {
      let title = $(elem);

      let img = title.find("img").first();
      let links = title.find("a");

      let idStr = links.first().attr("href");
      let id = idStr.match(/(\d+)(?=\/)/);

      let caption = title.find(".car-caption p:nth-child(2)");
      let updateTime = caption.find("span").text();
      newManga.push(
        createMangaTile({
          id: id[0],
          image: img.attr("data-src") ?? " ",
          title: createIconText({ text: img.attr("title") ?? " " }),
          subtitleText: createIconText({ text: caption.find("a").text() }),
          secondaryText: createIconText({
            text: updateTime,
            icon: "clock.fill",
          }),
        })
      );
    });

    return newManga;
  }

  parseRecentlyUpdatedMangaSectionTiles($) {
    let updates = [];
    let elem = $("tr", "tbody").toArray();
    let i = 0;

    while (i < elem.length) {
      let hasImg = false;
      let idStr = $("a.manga_title", elem[i]).attr("href") ?? "";
      let id = (idStr.match(/(\d+)(?=\/)/) ?? "")[0] ?? "";
      let title = $("a.manga_title", elem[i]).text() ?? "";
      let image = MD_DOMAIN + $("img", elem[i]).attr("src") ?? "";

      // in this case: badge will be number of updates
      // that the manga has received within last week
      let badge = 0;
      let pIcon = "eye.fill";
      let sIcon = "clock.fill";
      let subTitle = "";
      let pText = "";
      let sText = "";

      let first = true;
      i++;
      while (!hasImg && i < elem.length) {
        // for the manga tile, we only care about the first/latest entry
        if (first && !hasImg) {
          subTitle = $("a", elem[i]).first().text();
          pText = $(".text-center.text-info", elem[i]).text();
          sText = $("time", elem[i]).text().replace("ago", "").trim();
          first = false;
        }
        badge++;
        i++;

        hasImg = $(elem[i]).find("img").length > 0;
      }

      updates.push(
        createMangaTile({
          id,
          image,
          title: createIconText({ text: title }),
          subtitleText: createIconText({ text: subTitle }),
          primaryText: createIconText({ text: pText, icon: pIcon }),
          secondaryText: createIconText({ text: sText, icon: sIcon }),
          badge,
        })
      );
    }

    return updates;
  }

  getMangaDetails(data, metadata) {
    let result = JSON.parse(data);

    let mangas = [];
    for (let mangaDetails of result["result"]) {
      mangas.push(
        createManga({
          id: mangaDetails["id"].toString(),
          titles: mangaDetails["titles"][0],
          image: mangaDetails["image"],
          rating: mangaDetails["rating"],
          status: mangaDetails["status"],
          langFlag: mangaDetails["langFlag"],
          langName: mangaDetails["langName"],
          artist: mangaDetails["artist"],
          author: mangaDetails["author"],
          avgRating: mangaDetails["avgRating"],
          covers: mangaDetails["covers"],
          desc: mangaDetails["description"],
          follows: mangaDetails["follows"],
          users: mangaDetails["users"],
          views: mangaDetails["views"],
          hentai: mangaDetails["hentai"],
          relatedIds: mangaDetails["relatedIds"],
          lastUpdate: mangaDetails["lastUpdate"],
        })
      );
    }

    return mangas;
  }

  searchRequest(query, page) {
    return createRequestObject({
      url: MD_SEARCH,
      method: "POST",
      data: JSON.stringify({
        title: query.title,
      }),
      headers: {
        "content-type": "application/json",
      },
    });
  }

  search(data, metadata) {
    let mangas = this.getMangaDetails(data, {});
    return mangas.map((manga) => {
      return createMangaTile({
        id: manga.id,
        image: manga.image,
        title: createIconText({
          text:
            (typeof manga.titles === "string"
              ? manga.titles
              : manga.titles[0]) || "Unknown",
        }),
      });
    });
  }

  getMangaUrl(slug) {
    return `https://guya.moe/title/${slug}/`;
  }

  getSourceName() {
    return "MangaDex";
  }
}
