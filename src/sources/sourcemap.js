import MangaDex from "./MangaDex";
import Cubari from "./Cubari";
import NHentai from "./NHentai";
import Manganelo from "./Manganelo";

const hentai = localStorage.getItem("hentai");

const sourcemap = {};

if (hentai || window.location.search.includes("hentai")) {
  sourcemap["NHentai"] = new NHentai();
} else {
  sourcemap["MangaDex"] = new MangaDex();
  sourcemap["Cubari"] = new Cubari();
  sourcemap["Manganelo"] = new Manganelo();
}

export default sourcemap;
