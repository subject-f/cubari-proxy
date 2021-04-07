import { Source, Request, SourceInfo } from "paperback-extensions-common";
const axios = require("axios");

export abstract class CubariSource extends Source {
  abstract getMangaUrl(slug: string): string;

  abstract getSourceDetails(): SourceInfo;

  readonly requestManager: any = {
    requestsPerSecond: 2.5,
    requestTimeout: 5000,
    schedule: async function (request: Request, retryCount: number) {
      // Append any cookies into the header properly
      let headers: any = request.headers ?? {};

      // let cookieData = "";
      // for (let cookie of request.cookies ?? [])
      //   cookieData += `${cookie.name}=${cookie.value};`;

      // headers["cookie"] = cookieData;

      // If no user agent has been supplied, default to a basic Paperback-iOS agent
      // headers["user-agent"] = headers["user-agent"] ?? "Paperback-iOS";

      // If we are using a urlencoded form data as a post body, we need to decode the request for Axios
      let decodedData = request.data;
      if (
        headers["content-type"]?.includes("application/x-www-form-urlencoded")
      ) {
        decodedData = "";
        for (let attribute in request.data) {
          if (decodedData) {
            decodedData += "&";
          }
          decodedData += `${attribute}=${request.data[attribute]}`;
        }
      }

      // We must first get the response object from Axios, and then transcribe it into our own Response type before returning
      let response = await axios({
        url: `https://cors.bridged.cc/${request.url}${request.param ?? ""}`,
        method: request.method,
        headers: headers,
        data: decodedData,
        timeout: this.requestTimeout || 0,
      });

      return Promise.resolve(
        createResponseObject({
          data: response.data,
          status: response.status,
          headers: response.headers,
          request: request,
        })
      );
    },
  };
}
