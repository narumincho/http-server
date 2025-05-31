import type { OperationInternal } from "./operation.ts";

const pathItemSymbol: unique symbol = Symbol();

export type PathItem = {
  readonly get: OperationInternal | undefined;
  readonly post: OperationInternal | undefined;
  readonly put: OperationInternal | undefined;
  readonly delete: OperationInternal | undefined;
  readonly options: OperationInternal | undefined;
  readonly head: OperationInternal | undefined;
  readonly patch: OperationInternal | undefined;
  readonly subPath: { readonly [pathSegment: string]: PathItem } | undefined;
  readonly subPathVariable: {
    readonly variableName: string;
    readonly pathItem: PathItem;
  } | undefined;
  readonly [pathItemSymbol]: true;
};

/**
 * 直下で1つあるみたいな
 */
export const createPathItem = (
  {
    get,
    post,
    put,
    delete: _delete,
    options,
    head,
    patch,
    subPath,
    subPathVariable,
  }: {
    readonly get?: OperationInternal | undefined;
    readonly post?: OperationInternal | undefined;
    readonly put?: OperationInternal | undefined;
    readonly delete?: OperationInternal | undefined;
    readonly options?: OperationInternal | undefined;
    readonly head?: OperationInternal | undefined;
    readonly patch?: OperationInternal | undefined;
    readonly subPath?: { readonly [pathSegment: string]: PathItem } | undefined;
    readonly subPathVariable?: {
      readonly variableName: string;
      readonly pathItem: PathItem;
    } | undefined;
  },
): PathItem => {
  return {
    get,
    post,
    put,
    delete: _delete,
    options,
    head,
    patch,
    subPath,
    subPathVariable,
    [pathItemSymbol]: true,
  };
};

const supportedHttpMethod = [
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

export const getOperationByHttpMethod = (
  pathItem: PathItem,
  httpMethod: HttpMethod,
): OperationInternal | undefined => {
  switch (httpMethod) {
    case "GET":
      return pathItem.get;
    case "POST":
      return pathItem.post;
    case "PUT":
      return pathItem.put;
    case "DELETE":
      return pathItem.delete;
    case "PATCH":
      return pathItem.patch;
    case "HEAD":
      return pathItem.head;
    case "OPTIONS":
      return pathItem.options;
    case "CONNECT":
    case "TRACE":
      return undefined;
  }
};

export const getAllowMethods = (
  pathItem: PathItem,
): ReadonlyArray<HttpMethod> => {
  return supportedHttpMethod.filter((method) =>
    getOperationByHttpMethod(pathItem, method)
  );
};
