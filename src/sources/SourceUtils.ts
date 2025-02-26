import { CubariSourceMixin } from "./CubariSource";
import * as cheerio from 'cheerio';
import { Base64 } from "js-base64";
import { CubariSource, State } from "./types";

const PROXY_URL = "https://services.f-ck.me";

const IMAGE_RESIZE_URL = "https://resizer.f-ck.me";

const getJsDelivrBaseUrl = (
  user: string,
  repo: string,
  commit: string,
  filePath: string
): string => {
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${commit}/${filePath}`;
};

const loadExternalSource = async (
  baseUrl: string,
  sourceName: string,
  getMangaUrlCallback: (slug: string) => string,
  immutableState: State = {}
): Promise<CubariSource> => {
  // These sources should be loaded sequentially in order to prevent race conditions
  const script: HTMLScriptElement = document.createElement("script");
  script.type = "text/javascript";
  script.src = baseUrl + "/source.js";

  const waitForScript: Promise<Event> = new Promise(
    (resolve: (e: Event) => any): void => {
      script.onload = resolve;
    }
  );

  // Append the script to load it
  document.body.appendChild(script);
  await waitForScript;

  // The source should be loaded on window.Sources now
  const source = (<any>window).Sources[sourceName];
  const sourceInfo = (<any>window).Sources[sourceName + "Info"];

  // For the icon retrieval later
  sourceInfo.remoteBaseUrl = baseUrl;

  const cubariSource = new (CubariSourceMixin(
    source,
    sourceInfo,
    getMangaUrlCallback
  ))(cheerio);

  cubariSource.stateManager = {
    store: () => {}, // No-op, immutable
    retrieve: (key: string) => immutableState[key],
    keychain: {
      store: () => {},
      retrieve: (key: string) => immutableState[key],
    },
  };

  // Cleanup
  delete (<any>window).Sources;
  script.remove();

  return cubariSource;
};

const base64UrlEncode = (s: string): string => {
  return Base64.encode(s, true);
};

const convertImageUrl = (originalUrl: string): string => {
  return `${PROXY_URL}/v1/image/${base64UrlEncode(
    originalUrl
  )}?source=proxy_cubari_moe`;
};

const resizedImageUrl = (url: string, queryParams: string): string => {
  return `${IMAGE_RESIZE_URL}/?url=${url}&${queryParams ?? ""}`;
};

export {
  PROXY_URL,
  loadExternalSource,
  getJsDelivrBaseUrl,
  base64UrlEncode,
  convertImageUrl,
  resizedImageUrl,
};
