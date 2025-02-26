import { getJsDelivrBaseUrl, loadExternalSource } from "./SourceUtils";
import { RawSourceMap, SourceMap } from "./types";
import "./polyfills";

const nsfwSourceMap: RawSourceMap = {
  NHentai: {
    user: "TheNetsky",
    repo: "community-extensions",
    commit: "d51f8b63205d0b0151346a56819dc17c5da9bf32",
    filePath: "0.8/NHentai",
    state: {
      languages: "english",
    },
    slugMapper: (slug) => `https://cubari.moe/read/nhentai/${slug}/`,
  },
  MangaDex: {
    user: "funkyhippo",
    repo: "extensions-sources",
    commit: "390ee4a03ac8c842c0535a16182374cbcec83578",
    filePath: "primary/MangaDex",
    state: {
      ratings: ["pornographic"],
    },
    slugMapper: (slug) => `https://cubari.moe/read/mangadex/${slug}/`,
  },
};

const sfwSourceMap: RawSourceMap = {
  Guya: {
    user: "TheNetsky",
    repo: "extensions-generic",
    commit: "69638ea07448b57652664b2c3451a00d8206e04e",
    filePath: "guya/Guya",
    state: {},
    slugMapper: (slug) => `https://guya.moe/read/manga/${slug}/`,
  },
  DankeFursLesen: {
    user: "TheNetsky",
    repo: "extensions-generic",
    commit: "69638ea07448b57652664b2c3451a00d8206e04e",
    filePath: "guya/DankeFursLesen",
    state: {},
    slugMapper: (slug) => `https://danke.moe/read/manga/${slug}/`,
  },
  MangaDex: {
    user: "funkyhippo",
    repo: "extensions-sources",
    commit: "7108837f179b5de7ba08cf0f187c0691e4704d3b",
    filePath: "primary/MangaDex",
    state: {},
    slugMapper: (slug) => `https://cubari.moe/read/mangadex/${slug}/`,
  },
  WeebCentral: {
    user: "Einlion",
    repo: "weebcentral-mangapill-paperback-extensions",
    commit: "9b2c95cba5ef5fccc8c4771c033ec9592a97760b",
    filePath: "0.8/WeebCentral",
    state: {},
    slugMapper: (slug) => `https://cubari.moe/read/weebcentral/${slug}/`,
  },
  MangaKatana: {
    user: "TheNetsky",
    repo: "netskys-extensions",
    commit: "5d2f9d095e0b22ac2f3d0a3683ea26475a380554",
    filePath: "0.8/MangaKatana",
    state: {},
    slugMapper: (slug) =>
      `https://cubari.moe/mk/https://mangakatana.com/manga/${slug}/`,
  },
  AssortedScans: {
    user: "mangadventure",
    repo: "paperback-extensions",
    commit: "9b06321908e57373b3f3e60df4ce477172754623",
    filePath: "AssortedScans",
    state: {},
    slugMapper: (slug) =>
      `https://cubari.moe/ma/https://assortedscans.com/reader/${slug}/`
  },
};

const sourceMap: SourceMap = {};

const initSources = async (): Promise<void> => {
  const hentaiEnabled: string = localStorage.getItem("hentai") ?? "";
  const sources: RawSourceMap = hentaiEnabled ? nsfwSourceMap : sfwSourceMap;
  for (const [source, metadata] of Object.entries(sources)) {
    try{
      sourceMap[source] = await loadExternalSource(
        getJsDelivrBaseUrl(
          metadata.user,
          metadata.repo,
          metadata.commit,
          metadata.filePath
        ),
        source,
        metadata.slugMapper,
        metadata.state
      );
    }catch(e) {
      console.error('Failed to load', metadata.filePath, 'source.')
      console.trace(e)
    }
  }
};

export { initSources, sourceMap };
