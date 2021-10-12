import { SourceInfo } from "paperback-extensions-common";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

const UNSAFE_HEADERS = new Set(["cookie", "user-agent"]);

const requestInterceptor = (req: AxiosRequestConfig) => {
  req.url = `https://cubari-cors.herokuapp.com/${req.url}${req.params ?? ""}`;
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
    }
  };
}
