import {
  OpenAPI3,
  OperationObject,
  RequestBodyObject,
} from "npm:openapi-typescript";

type ExtractParams<Path extends string> = Path extends
  `${string}/:${infer Param}/${infer Rest}`
  ? { readonly [K in Param]: string } & ExtractParams<`/${Rest}`>
  : Path extends `${string}/:${infer Param}` ? { readonly [K in Param]: string }
  : Record<string, never>;

type PathItemObjectWithPath = {
  readonly path: string;
  // readonly
};

type TypedOperationObject<PathParameters> = {};

export const createPathItemObjectWithPath = <Path extends string>({ path }: {
  readonly path: Path;
  readonly get?: TypedOperationObject<ExtractParams<Path>> | undefined;
}): PathItemObjectWithPath => {
};

export const createOperationObject = <
  PathParameters extends string,
  RequestBodyObjectList extends RequestBodyObject[],
>({ requestBody }: {
  readonly requestBody: RequestBodyObjectList;
}): TypedOperationObject<PathParameters> => {};

export const requestBodyJson = ({}: {
  readonly;
}) => {};

export const httpServe = (
  { port, signal }: {
    readonly port?: number | undefined;
    readonly signal?: AbortSignal | undefined;
    readonly paths: ReadonlyArray<PathItemObjectWithPath>;
  },
): Deno.HttpServer<Deno.NetAddr> => {
  return Deno.serve(
    { ...(port ? { port } : {}), ...(signal ? { signal } : {}) },
    (request) => {
      return new Response();
    },
  );
};
