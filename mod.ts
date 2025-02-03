import {
  OpenAPI3,
  OperationObject,
  RequestBodyObject,
} from "npm:openapi-typescript";

type ExtractParams<Path extends string> = Path extends
  `${string}/:${infer Param}/${infer Rest}`
  ? { readonly [K in Param]: string } & ExtractParams<`/${Rest}`>
  : Path extends `${string}/:${infer Param}` ? { readonly [K in Param]: string }
  : Record<string, Record<string, unknown>>;

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

type HttpMethod = typeof supportedHttpMethod[number];

const supportedHttpMethodSet: ReadonlySet<string> = new Set(
  supportedHttpMethod,
);

const operationSymbol = Symbol();

type Operation = {
  readonly path: string;
  readonly method: HttpMethod;
  readonly queryParameters: Record<string, unknown> | undefined;
  readonly handler: (
    { pathParameters, queryParameters }: {
      readonly pathParameters: ExtractParams<string>;
      readonly queryParameters: Record<string, unknown>;
    },
  ) => Promise<Response>;
  readonly [operationSymbol]: true;
};

export const createOperation = <
  Path extends string,
  QueryParameters extends Record<string, unknown>,
>(
  { path, method, queryParameters, handler }: {
    readonly path: Path;
    readonly method: HttpMethod;
    readonly queryParameters: {
      [k in keyof QueryParameters]: {
        readonly description: string;
        readonly required: boolean;
      };
    };
    readonly handler: (
      { pathParameters, queryParameters }: {
        readonly pathParameters: ExtractParams<Path>;
        readonly queryParameters: QueryParameters;
      },
    ) => Promise<Response>;
  },
): Operation => {
  return {
    path,
    method,
    queryParameters,
    handler: handler as (
      { pathParameters, queryParameters }: {
        readonly pathParameters: ExtractParams<string>;
        readonly queryParameters: Record<string, unknown>;
      },
    ) => Promise<Response>,
    [operationSymbol]: true,
  };
};

// export const requestBodyJson = ({}: {
//   readonly;
// }) => {};

export const createHandler = (
  { paths }: {
    readonly paths: ReadonlyArray<Operation>;
  },
): (request: Request) => Promise<Response> => {
  return async (request): Promise<Response> => {
    const pathsGroupByPath: ReadonlyMap<
      string,
      ReadonlyArray<Operation>
    > = Map
      .groupBy(paths, (operation) => operation.path);
    for (const [path, operations] of pathsGroupByPath) {
      const urlPattern = new URLPattern({ pathname: path });
      const result = urlPattern.exec(request.url);
      if (result) {
        const mathMethodOperation = operations.find((operation) =>
          operation.method === request.method
        );
        if (mathMethodOperation) {
          return await mathMethodOperation.handler({
            pathParameters: result.pathname.groups as Record<string, never>,
            queryParameters: {},
          });
        }
        return new Response(undefined, {
          status: supportedHttpMethodSet.has(request.method) ? 405 : 501,
        });
      }
    }
    return new Response(undefined, {
      status: supportedHttpMethodSet.has(request.method) ? 404 : 501,
    });
  };
};
