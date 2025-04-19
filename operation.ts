import { QueryDefinition } from "./query.ts";
import { AnyBodyDefinition, BodyDefinition } from "./body.ts";
import { ResponseObjectDefinition } from "./response.ts";
import { RequestHeaderDefinition } from "./requestHeader.ts";

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

export const supportedHttpMethodSet: ReadonlySet<string> = new Set(
  supportedHttpMethod,
);

const operationSymbol: unique symbol = Symbol();

type ExtractParams<Path extends string> = Path extends
  `${string}/:${infer Param}/${infer Rest}`
  ? { readonly [K in Param]: string } & ExtractParams<`/${Rest}`>
  : Path extends `${string}/:${infer Param}` ? { readonly [K in Param]: string }
  : Record<string, Record<string, unknown>>;

type OperationInput<
  Path extends string,
  QueryParameters extends Record<string, QueryDefinition<unknown>>,
  RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  >,
  RequestBodyContent extends ReadonlyArray<AnyBodyDefinition>,
  Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
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
  readonly description?: string | undefined;
  readonly queryParameters?: QueryParameters | undefined;
  readonly requestHeaders?: RequestHeaders | undefined;
  readonly requestBody?: {
    readonly description: string;
    readonly content: RequestBodyContent;
  } | undefined;
  readonly responses: Responses;
  readonly handler: CreateHandlerType<
    NoInfer<Path>,
    NoInfer<QueryParameters>,
    NoInfer<RequestHeaders>,
    NoInfer<RequestBodyContent>,
    NoInfer<Responses>
  >;
};

export type CreateHandlerType<
  Path extends string,
  QueryParameters extends Record<string, QueryDefinition<unknown>>,
  RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  >,
  RequestBodyContent extends ReadonlyArray<AnyBodyDefinition>,
  Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  >,
> = (
  request: {
    readonly pathParameters: ExtractParams<Path>;
    readonly queryParameters: {
      [k in keyof QueryParameters]: QueryParameters[k]["example"];
    };
    readonly headers: {
      readonly [
        requestHeader in RequestHeaders[number] as requestHeader["name"]
      ]: ReturnType<requestHeader["decode"]>;
    };
    readonly body: BodyTransform<RequestBodyContent[number]>;
  },
) => Promise<ResponseTransform<Responses[number]>>;

type BodyTransform<T extends AnyBodyDefinition> = T extends
  BodyDefinition<infer M, infer C>
  ? { readonly mimeType: M; readonly content: C }
  : `expected BodyDefinition<M, C>`;

export type ResponseTransform<
  T extends ResponseObjectDefinition<
    string,
    ReadonlyArray<AnyBodyDefinition>
  >,
> = T extends ResponseObjectDefinition<infer S, infer B>
  ? { readonly statusCode: S; readonly content: BodyTransform<B[number]> }
  : `expected ResponseObjectDefinition<S, B>`;

export type OperationInternal = {
  readonly path: string;
  readonly method: HttpMethod;
  readonly description: string | undefined;
  readonly queryParameters: Record<
    string,
    QueryDefinition<unknown>
  >;
  readonly requestBody: {
    readonly description: string;
    readonly content: ReadonlyArray<AnyBodyDefinition>;
  } | undefined;
  readonly requestHeaders: ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  >;
  readonly responses: ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  >;
  readonly handler: (
    request: {
      readonly pathParameters: ExtractParams<string>;
      readonly queryParameters: Record<string, unknown>;
      readonly headers: Record<string, unknown>;
      readonly body:
        | { readonly mimeType: string; readonly content: unknown }
        | undefined;
    },
  ) => Promise<
    {
      readonly statusCode: string;
      readonly content: {
        readonly mimeType: string;
        readonly content: unknown;
      };
    }
  >;
  readonly [operationSymbol]: true;
};

export function createOperation<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  > = never,
  const RequestBodyContent extends ReadonlyArray<
    AnyBodyDefinition
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  > = never,
>(
  {
    path,
    method,
    description,
    queryParameters,
    requestHeaders,
    requestBody,
    responses,
    handler,
  }: OperationInput<
    Path,
    QueryParameters,
    RequestHeaders,
    RequestBodyContent,
    Responses
  >,
): OperationInternal {
  return {
    path,
    method,
    description,
    queryParameters: Object.fromEntries(
      Object.entries(queryParameters ?? {}).map(
        ([name, queryParameter]) => [
          name,
          queryParameter,
        ],
      ),
    ),
    requestHeaders: requestHeaders ?? [],
    requestBody: requestBody,
    responses,
    handler: handler as unknown as (
      request: {
        readonly pathParameters: ExtractParams<string>;
        readonly queryParameters: Record<string, unknown>;
        readonly body:
          | { readonly mimeType: string; readonly content: unknown }
          | undefined;
      },
    ) => Promise<
      {
        readonly statusCode: string;
        readonly content: {
          readonly mimeType: string;
          readonly content: unknown;
        };
      }
    >,
    [operationSymbol]: true,
  };
}

export function get<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  > = never,
>(
  { path, description, requestHeaders, queryParameters, responses, handler }:
    Omit<
      OperationInput<
        Path,
        QueryParameters,
        RequestHeaders,
        never,
        Responses
      >,
      "method" | "requestBody"
    >,
): OperationInternal {
  return createOperation<
    Path,
    QueryParameters,
    RequestHeaders,
    never,
    Responses
  >({
    path,
    method: "GET",
    description,
    queryParameters,
    requestHeaders,
    responses,
    handler,
  });
}

export function post<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  > = never,
  const RequestBodyContent extends ReadonlyArray<AnyBodyDefinition> = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  > = never,
>(
  {
    path,
    description,
    queryParameters,
    requestHeaders,
    requestBody,
    responses,
    handler,
  }: Omit<
    OperationInput<
      Path,
      QueryParameters,
      RequestHeaders,
      RequestBodyContent,
      Responses
    >,
    "method"
  >,
): OperationInternal {
  return createOperation<
    Path,
    QueryParameters,
    RequestHeaders,
    RequestBodyContent,
    Responses
  >({
    path,
    method: "POST",
    description,
    queryParameters,
    requestHeaders,
    requestBody,
    responses,
    handler,
  });
}

function delete_<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  > = never,
  const RequestBodyContent extends ReadonlyArray<
    AnyBodyDefinition
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  > = never,
>(
  { path, description, queryParameters, requestHeaders, responses, handler }:
    Omit<
      OperationInput<
        Path,
        QueryParameters,
        RequestHeaders,
        RequestBodyContent,
        Responses
      >,
      "method" | "requestBody"
    >,
): OperationInternal {
  return createOperation<
    Path,
    QueryParameters,
    RequestHeaders,
    RequestBodyContent,
    Responses
  >({
    path,
    method: "DELETE",
    description,
    queryParameters,
    requestHeaders,
    responses,
    handler,
  });
}

export { delete_ as delete };

export function patch<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<
    RequestHeaderDefinition<string, unknown>
  > = never,
  const RequestBodyContent extends ReadonlyArray<
    AnyBodyDefinition
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<AnyBodyDefinition>
    >
  > = never,
>(
  {
    path,
    description,
    queryParameters,
    requestHeaders,
    requestBody,
    responses,
    handler,
  }: Omit<
    OperationInput<
      Path,
      QueryParameters,
      RequestHeaders,
      RequestBodyContent,
      Responses
    >,
    "method"
  >,
): OperationInternal {
  return createOperation<
    Path,
    QueryParameters,
    RequestHeaders,
    RequestBodyContent,
    Responses
  >({
    path,
    method: "PATCH",
    description,
    queryParameters,
    requestHeaders,
    requestBody,
    responses,
    handler,
  });
}
