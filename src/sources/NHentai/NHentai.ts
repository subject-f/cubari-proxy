import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  MangaTile,
  SearchRequest,
  LanguageCode,
  TagSection,
  Request,
  SourceTag,
  TagType,
  PagedResults,
  SourceInfo,
} from "paperback-extensions-common";
const NHENTAI_DOMAIN = "https://nhentai.net";

const IMAGE_PROXY_BASE = "https://img-proxy.cubari.moe/";

export const NHentaiInfo: SourceInfo = {
  version: "2.0.2",
  name: "nHentai",
  description: `Extension which pulls 18+ content from nHentai. (Literally all of it. We know why you're here)`,
  author: `VibrantClouds`,
  authorWebsite: `https://github.com/conradweiser`,
  icon: `logo.png`,
  //hentaiSource: true,
  hentaiSource: false,
  sourceTags: [{ text: "18+", type: TagType.YELLOW }],
  websiteBaseURL: NHENTAI_DOMAIN,
};

export class NHentai extends Source {
  constructor(cheerio: CheerioAPI) {
    super(cheerio);
  }

  convertLanguageToCode(language: string) {
    switch (language.toLowerCase()) {
      case "english":
        return LanguageCode.ENGLISH;
      case "japanese":
        return LanguageCode.JAPANESE;
      case "chinese":
        return LanguageCode.CHINEESE;
      default:
        return LanguageCode.UNKNOWN;
    }
  }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${NHENTAI_DOMAIN}/g/${mangaId}`,
      method: "GET",
    });

    let data = await this.requestManager.schedule(request, 1);

    let $ = this.cheerio.load(data.data);
    let info = $("[itemprop=name]");
    let image = $("[itemprop=image]").attr("content") ?? "";
    let title = $("[itemprop=name]").attr("content") ?? "";

    // Comma seperate all of the tags and store them in our tag section
    let tagSections: TagSection[] = [
      createTagSection({ id: "0", label: "tag", tags: [] }),
    ];
    let tags =
      $('meta[name="twitter:description"]').attr("content")?.split(",") ?? [];
    tagSections[0].tags = tags.map((elem: string) =>
      createTag({ id: elem.trim(), label: elem.trim() })
    );

    // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
    title = title.replace(/(\[.+?\])/g, "").trim();

    // Grab the alternative titles
    let titles = [title];
    let altTitleBlock = $("#info");
    let altNameTop = $("h1", altTitleBlock).text() ?? "";
    let altNameBottom = $("h2", altTitleBlock).text() ?? "";
    if (altNameTop) {
      titles.push(altNameTop.trim());
    }
    if (altNameBottom) {
      titles.push(altNameBottom.trim());
    }

    // Get the artist and language information
    let context = $("#info-block");
    let artist = "";
    let language = "";
    for (let item of $(".tag-container", context).toArray()) {
      if ($(item).text().indexOf("Artists") > -1) {
        let temp = $("a", item).text();
        artist = temp.substring(0, temp.search(/\d/));
      } else if ($(item).text().indexOf("Languages") > -1) {
        let temp = $("a", item);
        if (temp.toArray().length > 1) {
          let temptext = $(temp.toArray()[1]).text();
          language = temptext.substring(0, temptext.indexOf(" ("));
        } else {
          let temptext = temp.text();
          language = temptext.substring(0, temptext.indexOf(" ("));
        }
      }
    }

    let status = 1;
    let hentai = true; // I'm assuming that's why you're here!

    return createManga({
      id: mangaId,
      titles: titles,
      image: image ? `${IMAGE_PROXY_BASE}${image}` : "",
      rating: 0,
      status: status,
      artist: artist,
      tags: tagSections,
      //hentai: hentai
      hentai: false,
    });
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${NHENTAI_DOMAIN}/g/${mangaId}`,
      method: "GET",
    });

    let data = await this.requestManager.schedule(request, 1);

    let $ = this.cheerio.load(data.data);
    let chapters: Chapter[] = [];

    // NHentai is unique, where there is only ever one chapter.
    let title = $("[itemprop=name]").attr("content") ?? "";
    let time = new Date($("time").attr("datetime") ?? "");

    // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
    title = title.replace(/(\[.+?\])/g, "").trim();

    // Get the correct language code
    let language: LanguageCode = LanguageCode.UNKNOWN;
    for (let item of $(".tag-container").toArray()) {
      if ($(item).text().indexOf("Languages") > -1) {
        let langs = $("span", item).text();

        if (langs.includes("japanese")) {
          language = LanguageCode.JAPANESE;
          break;
        } else if (langs.includes("english")) {
          language = LanguageCode.ENGLISH;
          break;
        } else if (langs.includes("chinese")) {
          language = LanguageCode.CHINEESE;
          break;
        }
      }
    }

    chapters.push(
      createChapter({
        id: "1", // Only ever one chapter on this source
        mangaId: mangaId,
        name: title,
        chapNum: 1,
        time: time,
        langCode: language,
      })
    );
    return chapters;
  }

  async getChapterDetails(
    mangaId: string,
    chapterId: string
  ): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${NHENTAI_DOMAIN}/g/${mangaId}`,
      method: "GET",
    });
    let data = await this.requestManager.schedule(request, 1);
    let $ = this.cheerio.load(data.data);

    // Get the number of chapters, we can generate URLs using that as a basis
    let pages: string[] = [];
    let thumbContainer = $("#thumbnail-container");
    let numChapters = $(".thumb-container", thumbContainer).length;

    // Get the gallery number that it is assigned to
    let gallerySrc = $("img", thumbContainer).attr("data-src");

    // We can regular expression match out the gallery ID from this string
    let galleryId = parseInt(gallerySrc?.match(/.*\/(\d*)\//)![1]!);

    // Get all of the pages
    let counter = 1;
    for (let obj of $($("img", ".thumb-container")).toArray()) {
      let imageType = $(obj)
        .attr("data-src")
        ?.match(/\.([png|jpg]{3,3})/g)![0];
      pages.push(
        `https://i.nhentai.net/galleries/${galleryId}/${counter}${imageType}`
      );
      counter++;
    }

    let chapterDetails = createChapterDetails({
      id: chapterId,
      mangaId: mangaId,
      pages: pages,
      longStrip: false,
    });

    return chapterDetails;
  }

  async searchRequest(
    query: SearchRequest,
    metadata: any
  ): Promise<PagedResults> {
    metadata = metadata ?? {};
    let page = metadata.page ?? 1;
    let sixDigit: boolean = false;

    // If h-sources are disabled for the search request, always return empty
    if (query.hStatus === false || !query.title) {
      // MARK: We only support title searches for now until advanced search is implemented
      return createPagedResults({ results: [] });
    }

    let request: Request | undefined = undefined;

    // If the search query is a six digit direct link to a manga, create a request to just that URL and alert the handler via metadata
    if (query.title?.match(/\d{5,6}/)) {
      request = createRequestObject({
        url: `${NHENTAI_DOMAIN}/g/${query.title}`,
        method: "GET",
      });
      sixDigit = true;
    } else {
      query.title = query.title?.trim();
      query.title = query.title.replace(/ /g, "+") + "+";

      request = createRequestObject({
        url: `${NHENTAI_DOMAIN}/search/?q=${query.title}&page=${page}`,
        method: "GET",
      });
      sixDigit = false;
    }

    let data = await this.requestManager.schedule(request, 1);

    let $ = this.cheerio.load(data.data);
    let mangaTiles: MangaTile[] = [];

    // Was this a six digit request?
    if (sixDigit) {
      // Retrieve the ID from the body
      let contextNode = $("#bigcontainer");
      let href = $("a", contextNode).attr("href");

      let mangaId = parseInt(href?.match(/g\/(\d*)\/\d/)![1]!);

      let title = $("[itemprop=name]").attr("content") ?? "";

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      title = title.replace(/(\[.+?\])/g, "").trim();

      let image = $("[itemprop=image]").attr("content");

      mangaTiles.push(
        createMangaTile({
          id: mangaId.toString(),
          title: createIconText({ text: title }),
          image: image ? `${IMAGE_PROXY_BASE}${image}` : "",
        })
      );

      return createPagedResults({
        results: mangaTiles,
      });
    }

    let containerNode = $(".index-container");
    for (let item of $(".gallery", containerNode).toArray()) {
      let currNode = $(item);
      let image = $("img", currNode).attr("data-src")!;

      // If image is undefined, we've hit a lazyload part of the website. Adjust the scraping to target the other features
      if (image == undefined) {
        image = "http:" + $("img", currNode).attr("src")!;
      }

      let title = $(".caption", currNode).text();
      let idHref = $("a", currNode)
        .attr("href")
        ?.match(/\/(\d*)\//)!;

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      title = title.replace(/(\[.+?\])/g, "").trim();

      mangaTiles.push(
        createMangaTile({
          id: idHref[1],
          title: createIconText({ text: title }),
          image: image ? `${IMAGE_PROXY_BASE}${image}` : "",
        })
      );
    }

    // Do we have any additional pages? If there is an `a.last` element, we do!
    if ($("a.last")) {
      metadata.page = ++page;
    } else {
      metadata = undefined;
    }

    return createPagedResults({
      results: mangaTiles,
      metadata: metadata,
    });
  }

  async getHomePageSections(
    sectionCallback: (section: HomeSection) => void
  ): Promise<void> {
    let popular: HomeSection = createHomeSection({
      id: "popular",
      title: "Popular Now",
    });
    let newUploads: HomeSection = createHomeSection({
      id: "new",
      title: "New Uploads",
      view_more: true,
    });
    sectionCallback(popular);
    sectionCallback(newUploads);

    const request = createRequestObject({
      url: `${NHENTAI_DOMAIN}`,
      method: "GET",
    });

    let data = await this.requestManager.schedule(request, 1);

    let popularHentai: MangaTile[] = [];
    let newHentai: MangaTile[] = [];
    let $ = this.cheerio.load(data.data);

    let containerNode = $(".index-container").first();
    for (let item of $(".gallery", containerNode).toArray()) {
      let currNode = $(item);
      let image = $("img", currNode).attr("data-src")!;

      // If image is undefined, we've hit a lazyload part of the website. Adjust the scraping to target the other features
      if (image == undefined) {
        image = "http:" + $("img", currNode).attr("src")!;
      }

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      let title = $(".caption", currNode).text();
      title = title.replace(/(\[.+?\])/g, "").trim();

      let idHref = $("a", currNode)
        .attr("href")
        ?.match(/\/(\d*)\//)!;

      popularHentai.push(
        createMangaTile({
          id: idHref[1],
          title: createIconText({ text: title }),
          image: image ? `${IMAGE_PROXY_BASE}${image}` : "",
        })
      );
    }

    popular.items = popularHentai;
    sectionCallback(popular);

    containerNode = $(".index-container").last();
    for (let item of $(".gallery", containerNode).toArray()) {
      let currNode = $(item);
      let image = $("img", currNode).attr("data-src")!;

      // If image is undefined, we've hit a lazyload part of the website. Adjust the scraping to target the other features
      if (image == undefined) {
        image = "http:" + $("img", currNode).attr("src")!;
      }

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      let title = $(".caption", currNode).text();
      title = title.replace(/(\[.+?\])/g, "").trim();

      let idHref = $("a", currNode)
        .attr("href")
        ?.match(/\/(\d*)\//)!;

      newHentai.push(
        createMangaTile({
          id: idHref[1],
          title: createIconText({ text: title }),
          image: image ? `${IMAGE_PROXY_BASE}${image}` : "",
        })
      );
    }

    newUploads.items = newHentai;
    sectionCallback(newUploads);
  }

  async getViewMoreItems(
    homepageSectionId: string,
    metadata: any
  ): Promise<PagedResults | null> {
    metadata = metadata ?? {};
    let page = metadata.page ?? 1;

    // This function only works for New Uploads, no need to check the section ID
    const request = createRequestObject({
      url: `${NHENTAI_DOMAIN}/?page=${page}`,
      method: "GET",
    });

    let data = await this.requestManager.schedule(request, 1);

    let $ = this.cheerio.load(data.data);

    let discoveredObjects: MangaTile[] = [];

    let containerNode = $(".index-container");
    for (let item of $(".gallery", containerNode).toArray()) {
      let currNode = $(item);
      let image = $("img", currNode).attr("data-src")!;

      // If image is undefined, we've hit a lazyload part of the website. Adjust the scraping to target the other features
      if (image == undefined) {
        image = "http:" + $("img", currNode).attr("src")!;
      }

      // Clean up the title by removing all metadata, these are items enclosed within [ ] brackets
      let title = $(".caption", currNode).text();
      title = title.replace(/(\[.+?\])/g, "").trim();

      let idHref = $("a", currNode)
        .attr("href")
        ?.match(/\/(\d*)\//)!;

      discoveredObjects.push(
        createMangaTile({
          id: idHref[1],
          title: createIconText({ text: title }),
          image: image ? `${IMAGE_PROXY_BASE}${image}` : "",
        })
      );
    }

    // Do we have any additional pages? If there is an `a.last` element, we do!
    if ($("a.last")) {
      metadata.page = ++page;
    } else {
      metadata = undefined;
    }

    return createPagedResults({
      results: discoveredObjects,
      metadata: metadata,
    });
  }
}
