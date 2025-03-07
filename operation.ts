import { QueryDefinition } from "./query.ts";
import { BodyDefinition } from "./body.ts";
import { ResponseObjectDefinition } from "./responseObject.ts";

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

const operationSymbol = Symbol();

type ExtractParams<Path extends string> = Path extends
  `${string}/:${infer Param}/${infer Rest}`
  ? { readonly [K in Param]: string } & ExtractParams<`/${Rest}`>
  : Path extends `${string}/:${infer Param}` ? { readonly [K in Param]: string }
  : Record<string, Record<string, unknown>>;

type OperationInput<
  Path extends string,
  QueryParameters extends Record<string, QueryDefinition<unknown>>,
  RequestBodyContent extends ReadonlyArray<
    BodyDefinition<string, unknown>
  >,
  Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
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
  readonly queryParameters?: QueryParameters | undefined;
  readonly requestBody?: {
    readonly description: string;
    readonly content: RequestBodyContent;
  } | undefined;
  readonly responses: Responses;
  readonly handler: (
    request: {
      readonly pathParameters: ExtractParams<Path>;
      readonly queryParameters: {
        [k in keyof QueryParameters]: QueryParameters[k]["example"];
      };
      readonly body: BodyTransform<RequestBodyContent[number]>;
    },
  ) => Promise<ResponseTransform<Responses[number]>>;
};

type BodyTransform<T> = T extends BodyDefinition<infer M, infer C>
  ? { readonly mimeType: M; readonly content: C }
  : never;

type ResponseTransform<T> = T extends ResponseObjectDefinition<infer S, infer C>
  ? { readonly statusCode: S; readonly content: BodyTransform<C[number]> }
  : never;

export type OperationInternal = {
  readonly path: string;
  readonly method: HttpMethod;
  readonly queryParameters: Record<
    string,
    QueryDefinition<unknown>
  >;
  readonly requestBody: {
    readonly description: string;
    readonly content: ReadonlyArray<BodyDefinition<string, unknown>>;
  } | undefined;
  readonly responses: ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
    >
  >;
  readonly handler: (
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
  >;
  readonly [operationSymbol]: true;
};

export function createOperation<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestBodyContent extends ReadonlyArray<
    BodyDefinition<string, unknown>
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
    >
  > = never,
>(
  { path, method, queryParameters, requestBody, responses, handler }:
    OperationInput<
      Path,
      QueryParameters,
      RequestBodyContent,
      Responses
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
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
    >
  > = never,
>(
  { path, queryParameters, responses, handler }: Omit<
    OperationInput<
      Path,
      QueryParameters,
      never,
      Responses
    >,
    "method" | "requestBody"
  >,
): OperationInternal {
  return createOperation<Path, QueryParameters, never, Responses>({
    path,
    method: "GET",
    queryParameters,
    responses,
    handler,
  });
}

export function post<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestBodyContent extends ReadonlyArray<
    BodyDefinition<string, unknown>
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
    >
  > = never,
>(
  { path, queryParameters, requestBody, responses, handler }: Omit<
    OperationInput<
      Path,
      QueryParameters,
      RequestBodyContent,
      Responses
    >,
    "method"
  >,
): OperationInternal {
  return createOperation<Path, QueryParameters, RequestBodyContent, Responses>({
    path,
    method: "POST",
    queryParameters,
    requestBody,
    responses,
    handler,
  });
}

function delete_<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestBodyContent extends ReadonlyArray<
    BodyDefinition<string, unknown>
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
    >
  > = never,
>(
  { path, queryParameters, responses, handler }: Omit<
    OperationInput<
      Path,
      QueryParameters,
      RequestBodyContent,
      Responses
    >,
    "method" | "requestBody"
  >,
): OperationInternal {
  return createOperation<Path, QueryParameters, RequestBodyContent, Responses>({
    path,
    method: "GET",
    queryParameters,
    responses,
    handler,
  });
}

export { delete_ as delete };

export function patch<
  const Path extends string,
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestBodyContent extends ReadonlyArray<
    BodyDefinition<string, unknown>
  > = never,
  const Responses extends ReadonlyArray<
    ResponseObjectDefinition<
      string,
      ReadonlyArray<BodyDefinition<string, unknown>>
    >
  > = never,
>(
  { path, queryParameters, requestBody, responses, handler }: Omit<
    OperationInput<
      Path,
      QueryParameters,
      RequestBodyContent,
      Responses
    >,
    "method"
  >,
): OperationInternal {
  return createOperation<Path, QueryParameters, RequestBodyContent, Responses>({
    path,
    method: "PATCH",
    queryParameters,
    requestBody,
    responses,
    handler,
  });
}
