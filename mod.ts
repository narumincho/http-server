import {
  OpenAPI3,
  OperationObject,
  RequestBodyObject,
} from "npm:openapi-typescript";
import { Query, QueryValueType, QueryValueTypeToTsType } from "./query.ts";

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

type OperationInput<
  Path extends string,
  QueryParameters extends Record<string, Query<unknown>>,
> = {
  readonly path: Path;
  readonly method: HttpMethod;
  /**
   * ```ts
   * queryParameters: {
   *   withArchived: queryBoolean({
   *     description: ""
   *   }),
   * }
   * ```
   */
  readonly queryParameters: QueryParameters;
  readonly handler: (
    { pathParameters, queryParameters }: {
      readonly pathParameters: ExtractParams<Path>;
      readonly queryParameters: {
        [k in keyof QueryParameters]: QueryParameters[k]["example"];
      };
    },
  ) => Promise<Response>;
};

type QueryParameterInput<
  Required extends boolean,
  Type extends QueryValueType,
> = {
  readonly description: string;
  readonly required: Required;
  readonly schema: Type;
  readonly example?: QueryValueTypeToTsType<Type> | undefined;
  /**
   * @default false
   */
  readonly deprecated?: boolean;
};

type OperationInternal = {
  readonly path: string;
  readonly method: HttpMethod;
  readonly queryParameters: Record<
    string,
    Query<unknown>
  >;
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
  QueryParameters extends Record<string, Query<unknown>>,
>(
  { path, method, queryParameters, handler }: OperationInput<
    Path,
    QueryParameters
  >,
): OperationInternal => {
  return {
    path,
    method,
    queryParameters: Object.fromEntries(
      Object.entries(queryParameters).map(
        ([name, queryParameter]) => [
          name,
          queryParameter,
        ],
      ),
    ),
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
    readonly paths: ReadonlyArray<OperationInternal>;
  },
): (request: Request) => Promise<Response> => {
  return async (request): Promise<Response> => {
    const pathsGroupByPath: ReadonlyMap<
      string,
      ReadonlyArray<OperationInternal>
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
          return await handleOperation({
            operation: mathMethodOperation,
            request,
            result,
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

const handleOperation = async (
  { operation, request, result }: {
    operation: OperationInternal;
    request: Request;
    result: URLPatternResult;
  },
): Promise<Response> => {
  const searchParams = new URL(request.url).searchParams;
  const queryParameters = Object.entries(operation.queryParameters ?? {}).map((
    [name, queryParameter],
  ): { type: "value"; name: string; value: unknown } | {
    type: "error";
    message: string;
  } => {
    const value = searchParams.get(name) ?? undefined;
    if (queryParameter.required && value === undefined) {
      return {
        type: "error",
        message: `${name} is required in url query parameter`,
      };
    }
    return { type: "value", name, value };
  });
  const errors = queryParameters.filter((e) => e.type === "error");
  if (errors.length > 0) {
    return new Response(
      JSON.stringify({ errors: errors.map((e) => ({ message: e.message })) }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      },
    );
  }

  return await operation.handler({
    pathParameters: result.pathname.groups as Record<string, never>,
    queryParameters: Object.fromEntries(
      queryParameters.flatMap((e) =>
        e.type === "value" ? [[e.name, e.value]] : []
      ),
    ),
  });
};
