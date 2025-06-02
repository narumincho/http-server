import { type HttpMethod, supportedHttpMethod } from "./http/method.ts";
import type {
  OperationInternalWithBody,
  OperationInternalWithoutBody,
} from "./operation.ts";

const pathItemSymbol: unique symbol = Symbol();

export type PathItem<PathVariables extends Record<string, unknown>> = {
  readonly get:
    | OperationInternalWithoutBody<NoInfer<PathVariables>>
    | undefined;
  readonly post: OperationInternalWithBody<NoInfer<PathVariables>> | undefined;
  readonly put: OperationInternalWithBody<NoInfer<PathVariables>> | undefined;
  readonly delete:
    | OperationInternalWithoutBody<NoInfer<PathVariables>>
    | undefined;
  readonly options:
    | OperationInternalWithoutBody<NoInfer<PathVariables>>
    | undefined;
  readonly head:
    | OperationInternalWithoutBody<NoInfer<PathVariables>>
    | undefined;
  readonly patch: OperationInternalWithBody<NoInfer<PathVariables>> | undefined;
  readonly subPath:
    | { readonly [pathSegment: string]: PathItem<PathVariables> }
    | undefined;
  readonly subPathVariable: SubPathVariable<PathVariables, string> | undefined;
  readonly [pathItemSymbol]: true;
};

export type SubPathVariable<
  PathVariables extends Record<string, unknown>,
  VariableName extends string,
> = {
  readonly variableName: VariableName;
  readonly pathItem: PathItem<
    ObjectAddVariable<PathVariables, VariableName>
  >;
};

export type ObjectAddVariable<A, VariableName extends string> = {
  [k in keyof A | VariableName]: k extends keyof A ? A[k]
    : k extends VariableName ? string
    : never;
};

/**
 * 直下で1つあるみたいな
 */
export const createPathItem = <
  const PathVariables extends Record<string, unknown>,
  const variableName extends string,
>(
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
    readonly get?:
      | OperationInternalWithoutBody<NoInfer<PathVariables>>
      | undefined;
    readonly post?:
      | OperationInternalWithBody<NoInfer<PathVariables>>
      | undefined;
    readonly put?:
      | OperationInternalWithBody<NoInfer<PathVariables>>
      | undefined;
    readonly delete?:
      | OperationInternalWithoutBody<NoInfer<PathVariables>>
      | undefined;
    readonly options?:
      | OperationInternalWithoutBody<NoInfer<PathVariables>>
      | undefined;
    readonly head?:
      | OperationInternalWithoutBody<NoInfer<PathVariables>>
      | undefined;
    readonly patch?:
      | OperationInternalWithBody<NoInfer<PathVariables>>
      | undefined;
    readonly subPath?: {
      readonly [pathSegment: string]: PathItem<NoInfer<PathVariables>>;
    } | undefined;
    readonly subPathVariable?:
      | SubPathVariable<NoInfer<PathVariables>, variableName>
      | undefined;
  },
): PathItem<PathVariables> => {
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

export const getOperationByHttpMethod = <
  PathVariables extends Record<string, unknown>,
>(
  pathItem: PathItem<PathVariables>,
  httpMethod: HttpMethod,
):
  | OperationInternalWithBody<NoInfer<PathVariables>>
  | OperationInternalWithoutBody<NoInfer<PathVariables>>
  | undefined => {
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

export const getAllowMethods = <PathVariables extends Record<string, unknown>>(
  pathItem: PathItem<PathVariables>,
): ReadonlyArray<HttpMethod> => {
  return supportedHttpMethod.filter((method) =>
    getOperationByHttpMethod(pathItem, method)
  );
};
