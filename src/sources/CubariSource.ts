import { SourceInfo } from "paperback-extensions-common";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

const UNSAFE_HEADERS = new Set(["cookie", "user-agent"]);
const PROXY_URL = "https://services.f-ck.me";

const base64UrlEncode = (s: string): string => {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_");
};

export const convertImageUrl = (originalUrl: string): string => {
  return `${PROXY_URL}/v1/image/${base64UrlEncode(originalUrl)}`;
};

const requestInterceptor = (req: AxiosRequestConfig) => {
  req.url = `${PROXY_URL}/v1/cors/${base64UrlEncode(
    req.url + (req.params ?? "")
  )}`;
  Object.keys(req.headers).forEach((header) => {
    if (UNSAFE_HEADERS.has(header.toLowerCase())) {
      delete req.headers[header];
    }
  });
  return req;
};

const responseInterceptor = (res: AxiosResponse) => {
  return res;
};

// Interceptors to preserve the requestManager within each source. Thanks Paper!
axios.interceptors.request.use(requestInterceptor);
axios.interceptors.response.use(responseInterceptor);

type Constructor = new (...args: any[]) => {};

export function CubariSourceMixin<TBase extends Constructor>(
  Base: TBase,
  sourceInfo: SourceInfo,
  getMangaUrlCallback: (slug: string) => string
) {
  return class CubariSource extends Base {
    getMangaUrl = getMangaUrlCallback;

    getSourceDetails = () => {
      return sourceInfo;
    };
  };
}
