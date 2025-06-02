export const supportedHttpMethod = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
  "CONNECT",
  "TRACE",
] as const;

/**
 * https://datatracker.ietf.org/doc/html/rfc9110#section-9.3
 */
export type HttpMethod = typeof supportedHttpMethod[number];

export const httpMethodFromString = (
  value: string,
): HttpMethod | undefined => {
  switch (value) {
    case "GET":
      return "GET";
    case "POST":
      return "POST";
    case "PUT":
      return "PUT";
    case "DELETE":
      return "DELETE";
    case "PATCH":
      return "PATCH";
    case "HEAD":
      return "HEAD";
    case "OPTIONS":
      return "OPTIONS";
    case "CONNECT":
      return "CONNECT";
    case "TRACE":
      return "TRACE";
    default:
      return undefined;
  }
};
