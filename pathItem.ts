import { type HttpMethod, supportedHttpMethod } from "./http/method.ts";
import type {
  OperationInternalWithBody,
  OperationInternalWithoutBody,
} from "./operation.ts";

const pathItemSymbol: unique symbol = Symbol();

export type PathItem = {
  readonly get: OperationInternalWithoutBody | undefined;
  readonly post: OperationInternalWithBody | undefined;
  readonly put: OperationInternalWithBody | undefined;
  readonly delete: OperationInternalWithoutBody | undefined;
  readonly options: OperationInternalWithoutBody | undefined;
  readonly head: OperationInternalWithoutBody | undefined;
  readonly patch: OperationInternalWithBody | undefined;
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
    readonly get?: OperationInternalWithoutBody | undefined;
    readonly post?: OperationInternalWithBody | undefined;
    readonly put?: OperationInternalWithBody | undefined;
    readonly delete?: OperationInternalWithoutBody | undefined;
    readonly options?: OperationInternalWithoutBody | undefined;
    readonly head?: OperationInternalWithoutBody | undefined;
    readonly patch?: OperationInternalWithBody | undefined;
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

export const getOperationByHttpMethod = (
  pathItem: PathItem,
  httpMethod: HttpMethod,
): OperationInternalWithBody | OperationInternalWithoutBody | undefined => {
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
