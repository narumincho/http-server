/**
 * https://spec.openapis.org/oas/latest.html#openapi-object
 */
export type OpenAPIObject = {
  readonly openapi: "3.1.1";
  readonly info: InfoObject;
};

/**
 * https://spec.openapis.org/oas/latest.html#info-object
 */
export type InfoObject = {
  readonly title: string;
  readonly summary?: string | null;
  readonly description?: string | null;
  readonly version: string;
};
