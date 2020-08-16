import MangaDex from "./MangaDex";
import Guya from "./Guya";
import NHentai from "./NHentai";

const hentai = localStorage.getItem("hentai");

const sourcemap = {
  MangaDex: new MangaDex(),
  Guya: new Guya(),
};

if (hentai || window.location.search.includes("hentai")) {
  sourcemap["NHentai"] = new NHentai();
}

export default sourcemap;
