import { getJsDelivrBaseUrl, loadExternalSource } from "./SourceUtils";
import { RawSourceMap, SourceMap } from "./types";
import "./polyfills";

const nsfwSourceMap: RawSourceMap = {
  NHentai: {
    user: "Paperback-iOS",
    repo: "extensions-sources",
    commit: "390ee4a03ac8c842c0535a16182374cbcec83578",
    filePath: "hentai/NHentai",
    state: {
      languages: "english",
    },
    slugMapper: (slug) => `https://cubari.moe/read/nhentai/${slug}/`,
  },
  MangaDex: {
    user: "Paperback-iOS",
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
    user: "Paperback-iOS",
    repo: "extensions-promises",
    commit: "79273525a655023aee5e3ffc5604cf8b6044cd34",
    filePath: "Guya",
    state: {},
    slugMapper: (slug) => `https://guya.moe/read/manga/${slug}/`,
  },
  Hachirumi: {
    user: "Paperback-iOS",
    repo: "extensions-promises",
    commit: "ef94de5f68177f0c723640b4fffbe3e91dda9e74",
    filePath: "Hachirumi",
    state: {},
    slugMapper: (slug) => `https://hachirumi.com/read/manga/${slug}/`,
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
    commit: "fc821ab7add7bf7c28569f4a6da4e0b24e3992f7",
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
  }
};

export { initSources, sourceMap };
