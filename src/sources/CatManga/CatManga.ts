import {
  Chapter,
  ChapterDetails,
  HomeSection,
  Manga,
  MangaTile,
  MangaUpdates,
  PagedResults,
  Request,
  RequestManager,
  SearchRequest,
  Source,
  SourceInfo,
} from "paperback-extensions-common";
import { CatMangaParser } from "./CatMangaParser";

const BASE = "https://catmanga.org";

export const CatMangaInfo: SourceInfo = {
  icon: "icon.png",
  version: "1.2.4",
  name: "CatManga",
  author: "PythonCoderAS",
  authorWebsite: "https://github.com/PythonCoderAS",
  description: "Extension that pulls manga from CatManga",
  language: "en",
  hentaiSource: false,
  websiteBaseURL: BASE,
};

export class CatManga extends Source {
  private readonly parser: CatMangaParser = new CatMangaParser();

  readonly requestManager: RequestManager = createRequestManager({
    requestsPerSecond: 5,
    requestTimeout: 10000,
  });

  getMangaShareUrl(mangaId: string): string | null {
    return `${BASE}/series/${mangaId}`;
  }

  async getHomePageSections(
    sectionCallback: (section: HomeSection) => void
  ): Promise<void> {
    const $ = await this.getHomePageData();
    sectionCallback(
      createHomeSection({
        id: "featured",
        title: "Featured",
        items: this.getFeatured($),
      })
    );
    sectionCallback(
      createHomeSection({
        id: "latest",
        title: "Latest",
        items: this.getLatest($),
      })
    );
    sectionCallback(
      createHomeSection({
        id: "all",
        items: this.getAll($),
        title: "All Manga",
      })
    );
  }

  async getHomePageData(): Promise<CheerioStatic> {
    const options: Request = createRequestObject({
      url: `${BASE}`,
      method: "GET",
    });
    let response = await this.requestManager.schedule(options, 1);
    return this.cheerio.load(response.data);
  }

  getFeatured($: CheerioStatic) {
    const jsonData = JSON.parse($("script#__NEXT_DATA__").html() || "{}");
    return jsonData.props.pageProps.featured.map((manga: any) =>
      createMangaTile({
        id: manga.series_id,
        title: createIconText({
          text: manga.title,
        }),
        image: manga.cover_art.source,
      })
    );
  }

  getLatest($: CheerioStatic) {
    // TODO push this upstream to fix it, probably
    const jsonData = JSON.parse($("script#__NEXT_DATA__").html() || "{}");
    const latestSeries = jsonData.props.pageProps.latests.map((e: any) => e[0]);
    const uniqueSeries = new Set();
    const finalSeriesData: any = [];
    latestSeries.forEach((manga: any) => {
      if (!uniqueSeries.has(manga.series_id)) {
        uniqueSeries.add(manga.series_id);
        finalSeriesData.push(manga);
      }
    });

    return finalSeriesData.map((manga: any) =>
      createMangaTile({
        id: manga.series_id,
        title: createIconText({
          text: manga.title,
        }),
        image: manga.cover_art.source,
      })
    );
  }

  getAll($: CheerioStatic) {
    const jsonData = JSON.parse($("script#__NEXT_DATA__").html() || "{}");
    return jsonData.props.pageProps.series.map((manga: any) =>
      createMangaTile({
        id: manga.series_id,
        title: createIconText({
          text: manga.title,
        }),
        image: manga.cover_art.source,
      })
    );
  }

  async getWebsiteMangaDirectory(metadata: any): Promise<PagedResults> {
    return createPagedResults({
      results: this.parser.parseTileList(
        await this.getHomePageData(),
        "allseries"
      ),
    });
  }

  async getChapterDetails(
    mangaId: string,
    chapterId: string
  ): Promise<ChapterDetails> {
    const options: Request = createRequestObject({
      url: `${BASE}/series/${mangaId}/${chapterId}`,
      method: "GET",
    });
    let response = await this.requestManager.schedule(options, 1);
    let $ = this.cheerio.load(response.data);
    return createChapterDetails({
      id: chapterId,
      longStrip: true,
      mangaId: mangaId,
      pages: this.parser.parsePages($),
    });
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const options: Request = createRequestObject({
      url: `${BASE}/series/${mangaId}`,
      method: "GET",
    });
    let response = await this.requestManager.schedule(options, 1);
    let $ = this.cheerio.load(response.data);
    return this.parser.parseChapterList($, mangaId);
  }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const options: Request = createRequestObject({
      url: `${BASE}/series/${mangaId}`,
      method: "GET",
    });
    let response = await this.requestManager.schedule(options, 1);
    let $ = this.cheerio.load(response.data);
    return this.parser.parseManga($, mangaId);
  }

  async searchRequest(
    query: SearchRequest,
    metadata: any
  ): Promise<PagedResults> {
    // TODO: Wait for search to be implemented on the website.
    const results = this.getAll(await this.getHomePageData());
    const data: MangaTile[] = [];
    for (let i = 0; i < results.length; i++) {
      const key = results[i];
      if (query.title) {
        if (
          (key.title.text || "")
            .toLowerCase()
            .includes(query.title.toLowerCase())
        ) {
          data.push(key);
        }
      }
    }
    return createPagedResults({
      results: data,
    });
  }

  async filterUpdatedManga(
    mangaUpdatesFoundCallback: (updates: MangaUpdates) => void,
    time: Date,
    ids: string[]
  ): Promise<void> {
    // TODO: Wait for upload times to be shown.
    /*
      const tiles: MangaTile[] = this.getLatest(await this.getHomePageData());
      const idsFound: string[] = [];
      for (let i = 0; i < tiles.length; i++) {
          const id = tiles[i].id;
          if (ids.includes(id)){
              idsFound.push(id)
          }
      }
      mangaUpdatesFoundCallback(createMangaUpdates({
          ids: idsFound
      }));
      */
  }
}
