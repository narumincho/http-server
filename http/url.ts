/**
 * Structured, read-only URLs
 * where you don't have to worry about Trailing Slash or anything else
 */
export type SimpleUrl = {
  readonly origin: string;
  readonly pathSegments: ReadonlyArray<string>;
  readonly query: ReadonlyMap<string, ReadonlyArray<string>>;
};

export const urlToSimpleUrl = (url: URL): SimpleUrl => ({
  origin: url.origin,
  pathSegments: url.pathname
    .split("/")
    .filter((segment) => segment)
    .map((segment) => decodeURIComponent(segment)),
  query: new Map(
    url.searchParams.values().map((value) => [
      value,
      url.searchParams.getAll(value),
    ]),
  ),
});
