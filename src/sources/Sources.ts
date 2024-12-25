import { getJsDelivrBaseUrl, loadExternalSource } from "./SourceUtils";
import { RawSourceMap, SourceMap } from "./types";
import "./polyfills";

const nsfwSourceMap: RawSourceMap = {
  NHentai: {
    user: "funkyhippo",
    repo: "extensions-sources",
    commit: "390ee4a03ac8c842c0535a16182374cbcec83578",
    filePath: "hentai/NHentai",
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
  MangaLife: {
    user: "Paperback-iOS",
    repo: "extensions-generic",
    commit: "31394f552f5acd4bd74a4748f7b7aedb38913699",
    filePath: "nepnep/MangaLife",
    state: {},
    slugMapper: (slug) => `https://cubari.moe/ml/${slug}/`,
  },
  MangaKatana: {
    user: "TheNetsky",
    repo: "netskys-extensions",
    commit: "dcf18472ce4c75d5144b9f87e3697aab415570d5",
    filePath: "0.6/MangaKatana",
    state: {},
    slugMapper: (slug) =>
      `https://cubari.moe/mk/https://mangakatana.com/manga/${slug}/`,
  },
  AssortedScans: {
    user: "mangadventure",
    repo: "paperback-extensions",
    commit: "87ad4a6b110e4ccf25bcd4a4622153e3ca867037",
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
