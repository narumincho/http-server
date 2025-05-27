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
