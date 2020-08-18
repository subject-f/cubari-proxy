import MangaDex from "./MangaDex";
import Guya from "./Guya";
import NHentai from "./NHentai";

const hentai = localStorage.getItem("hentai");

const sourcemap = {};

if (hentai || window.location.search.includes("hentai")) {
  sourcemap["NHentai"] = new NHentai();
} else {
  sourcemap["MangaDex"] = new MangaDex();
  sourcemap["Guya"] = new Guya();
}

export default sourcemap;
