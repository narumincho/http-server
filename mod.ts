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
  readonly get?: TypedOperationObject<Record<string, unknown>> | undefined;
};

const pathParametersSymbol = Symbol();

type TypedOperationObject<
  in out PathParameters extends Record<string, unknown>,
> = {
  // readonly [pathParametersSymbol]: PathParameters;
  readonly handler: (
    { pathParameters }: { readonly pathParameters: PathParameters },
  ) => Promise<Response>;
};

export const createPathItemObjectWithPath = <Path extends string>(
  { path, get }: {
    readonly path: Path;
    readonly get?: TypedOperationObject<ExtractParams<Path>> | undefined;
  },
): PathItemObjectWithPath => {
  return {
    path,
    get: get as TypedOperationObject<Record<string, unknown>> | undefined,
  };
};

// export const createOperationObject = <
//   PathParameters extends Record<string, unknown>,
// >({ handler }: {
//   handler: (
//     { pathParameters }: { readonly pathParameters: PathParameters },
//   ) => Promise<Response>;
// }): TypedOperationObject<PathParameters> => {
//   return {
//     handler,
//   };
// };

// export const requestBodyJson = ({}: {
//   readonly;
// }) => {};

export const createHandler = (
  { paths }: {
    readonly paths: ReadonlyArray<PathItemObjectWithPath>;
  },
): (request: Request) => Promise<Response> => {
  return async (request): Promise<Response> => {
    for (const { path, get } of paths) {
      const urlPattern = new URLPattern({ pathname: path });
      const result = urlPattern.exec(request.url);
      if (result) {
        switch (request.method) {
          case "GET":
            if (!get) {
              return new Response(undefined, { status: 405 });
            }
            return await get.handler({
              pathParameters: result.pathname.groups,
            });
          case "POST":
          case "PUT":
          case "DELETE":
          case "PATCH":
          case "HEAD":
          case "OPTIONS":
          case "CONNECT":
          case "TRACE":
            return new Response(undefined, { status: 405 });
        }
      }
    }
    return new Response(undefined, { status: 404 });
  };
};
