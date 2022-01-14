import { Source, SourceInfo } from "paperback-extensions-common";

export type Constructor = new (...args: any[]) => {};

export interface State {
  [s: string]: unknown;
}

export interface SourceMetadata {
  user: string;
  repo: string;
  commit: string;
  filePath: string;
  state: State;
  slugMapper: (s: string) => string;
}

export interface RawSourceMap {
  [source: string]: SourceMetadata;
}

export interface SourceMap {
  [source: string]: CubariSource;
}

export interface CubariSource extends Source {
  getMangaUrl: (slug: string) => string;
  getSourceDetails: () => SourceInfo;
}
