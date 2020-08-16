import fetch from "./fetch.js";

export const createRequestObject = (obj) => {
  const req = async function () {
    return fetch(obj.url, {
      method: obj.method || "GET",
      headers: obj.headers || {},
      referrerPolicy: "no-referrer",
      body: obj.data,
    });
  };
  req.metadata = obj.metadata;
  return req;
};

export const createHomeSection = (obj) => {
  return obj;
};

export const createHomeSectionRequest = (obj) => {
  return obj;
};

export const createIconText = (obj) => {
  return obj.text || "";
};

export const createMangaTile = (obj) => {
  return {
    coverUrl: obj.image,
    slug: obj.id,
    mangaTitle: obj.title,
  };
};

export const createManga = (obj) => {
  return obj;
};
