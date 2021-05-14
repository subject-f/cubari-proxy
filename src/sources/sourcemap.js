import { NHentai } from "./NHentai/NHentai";
import { MangaKatana } from "./MangaKatana/MangaKatana";
import { Guya } from "./Guya/Guya";
// import { Mangakakalot } from "./Mangakakalot/Mangakakalot";
import { MangaDex } from "./MangaDex/MangaDex";
import { MangaLife } from "./MangaLife/MangaLife";
import { CatManga } from "./CatManga/CatManga";
import cheerio from "cheerio";

const hentai = localStorage.getItem("hentai");

const sourcemap = {};

if (hentai || window.location.search.includes("hentai")) {
  sourcemap["NHentai"] = new NHentai(cheerio);
} else {
  sourcemap["MangaKatana"] = new MangaKatana(cheerio);
  sourcemap["Guya"] = new Guya(cheerio);
  // sourcemap["Mangakakalot"] = new Mangakakalot(cheerio);
  sourcemap["MangaDex"] = new MangaDex(cheerio);
  sourcemap["MangaLife"] = new MangaLife(cheerio);
  sourcemap["CatManga"] = new CatManga(cheerio);
}

export default sourcemap;
