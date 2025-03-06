import {
  QueryDefinition,
  QueryValueType,
  QueryValueTypeToTsType,
} from "./query.ts";
import { RequestBodyDefinition } from "./requestBody.ts";

export * as json from "./json.ts";
export * as query from "./query.ts";
export * as requestBody from "./requestBody.ts";

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
  QueryParameters extends Record<string, QueryDefinition<unknown>>,
  RequestBodyContent extends ReadonlyArray<
    RequestBodyDefinition<string, unknown>
  >,
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
  readonly queryParameters?: QueryParameters;
  readonly requestBody?: {
    readonly description: string;
    readonly content: RequestBodyContent;
  };
  readonly handler: (
    { pathParameters, queryParameters }: {
      readonly pathParameters: ExtractParams<Path>;
      readonly queryParameters: {
        [k in keyof QueryParameters]: QueryParameters[k]["example"];
      };
      readonly body: RequestBodyTransform<RequestBodyContent[number]>;
    },
  ) => Promise<Response>;
};

type RequestBodyTransform<T> = T extends RequestBodyDefinition<infer M, infer C>
  ? { readonly mimeType: M; readonly content: C }
  : never;

type OperationInternal = {
  readonly path: string;
  readonly method: HttpMethod;
  readonly queryParameters: Record<
    string,
    QueryDefinition<unknown>
  >;
  readonly requestBody: {
    readonly description: string;
    readonly content: ReadonlyArray<RequestBodyDefinition<string, unknown>>;
  } | undefined;
  readonly handler: (
    { pathParameters, queryParameters }: {
      readonly pathParameters: ExtractParams<string>;
      readonly queryParameters: Record<string, unknown>;
      readonly body:
        | { readonly mimeType: string; readonly content: unknown }
        | undefined;
    },
  ) => Promise<Response>;
  readonly [operationSymbol]: true;
};

export function createOperation<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestBodyContent extends ReadonlyArray<
    RequestBodyDefinition<string, unknown>
  > = never,
>(
  { path, method, queryParameters, requestBody, handler }: OperationInput<
    Path,
    QueryParameters,
    RequestBodyContent
  >,
): OperationInternal {
  return {
    path,
    method,
    queryParameters: Object.fromEntries(
      Object.entries(queryParameters ?? {}).map(
        ([name, queryParameter]) => [
          name,
          queryParameter,
        ],
      ),
    ),
    requestBody: requestBody,
    handler: handler as (
      { pathParameters, queryParameters }: {
        readonly pathParameters: ExtractParams<string>;
        readonly queryParameters: Record<string, unknown>;
      },
    ) => Promise<Response>,
    [operationSymbol]: true,
  };
}

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
    try {
      return {
        type: "value",
        name,
        value: queryParameter.decode(searchParams.getAll(name)),
      };
    } catch (e) {
      return { type: "error", message: `${e} in query ${name}` };
    }
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

  const contentType = request.headers.get("content-type");
  const needBody = operation.requestBody !== undefined &&
    operation.requestBody.content.length > 0;
  if (
    needBody && request.body === null
  ) {
    return new Response(
      JSON.stringify({
        errors: [{ message: "body is required" }],
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      },
    );
  }
  const matchedRequestBodyDefinition = contentType
    ? operation.requestBody?.content.find((e) => e.mimeType === contentType)
    : undefined;

  if (needBody && matchedRequestBodyDefinition === undefined) {
    return new Response(
      JSON.stringify({
        errors: [{ message: "content-type is invalid" }],
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 415,
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
    body: matchedRequestBodyDefinition
      ? {
        mimeType: matchedRequestBodyDefinition.mimeType,
        content: await matchedRequestBodyDefinition.decode(request),
      }
      : undefined,
  });
};
