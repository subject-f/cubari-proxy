import { NHentai, NHentaiInfo } from "./NHentai/NHentai";
import {
  MangaKatana,
  MangaKatanaInfo,
  MK_DOMAIN,
} from "./MangaKatana/MangaKatana";
import { Guya, GuyaInfo } from "./Guya/Guya";
import { MangaDex, MangaDexInfo } from "./MangaDex/MangaDex";
import { MangaLife, MangaLifeInfo } from "./MangaLife/MangaLife";
import { CatManga, CatMangaInfo } from "./CatManga/CatManga";
import { CubariSourceMixin } from "./CubariSource";
import cheerio from "cheerio";
// import { Mangakakalot, MangakakalotInfo } from "./Mangakakalot/Mangakakalot";

const hentai = localStorage.getItem("hentai");

const sourcemap = {};

if (hentai) {
  sourcemap["NHentai"] = new (CubariSourceMixin(
    NHentai,
    NHentaiInfo,
    (slug) => `https://cubari.moe/read/nhentai/${slug}/`
  ))(cheerio);
} else {
  sourcemap["Guya"] = new (CubariSourceMixin(
    Guya,
    GuyaInfo,
    (slug) => `https://guya.moe/read/manga/${slug}/`
  ))(cheerio);
  sourcemap["MangaLife"] = new (CubariSourceMixin(
    MangaLife,
    MangaLifeInfo,
    (slug) => `https://cubari.moe/ml/${slug}/`
  ))(cheerio);
  sourcemap["MangaKatana"] = new (CubariSourceMixin(
    MangaKatana,
    MangaKatanaInfo,
    (slug) => `https://cubari.moe/mk/${MK_DOMAIN}/manga/${slug}/`
  ))(cheerio);
  // sourcemap["Mangakakalot"] = new (CubariSourceMixin(
  //   Mangakakalot,
  //   MangakakalotInfo,
  //   (slug) => `https://cubari.moe/mb/${slug}/`
  // ))(cheerio);
  sourcemap["CatManga"] = new (CubariSourceMixin(
    CatManga,
    CatMangaInfo,
    (slug) => `https://catmanga.org/series/${slug}/`
  ))(cheerio);
  sourcemap["MangaDex"] = new (CubariSourceMixin(
    MangaDex,
    MangaDexInfo,
    (slug) => `https://cubari.moe/read/mangadex/${slug}/`
  ))(cheerio);
}

export default sourcemap;
