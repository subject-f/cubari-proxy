import { SourceInfo } from "paperback-extensions-common";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

const requestInterceptor = (req: AxiosRequestConfig) => {
  const request = req;
  request.url = `https://cors.bridged.cc/${request.url}${request.params ?? ""}`;
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

    getSourceDetails(): SourceInfo {
      return sourceInfo;
    }
  };
}
