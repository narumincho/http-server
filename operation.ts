import type { QueryDefinition } from "./query.ts";
import type { AnyBodyDefinition } from "./body.ts";
import type { AnyResponseDefinition } from "./response.ts";
import type { AnyRequestHeaderDefinition } from "./requestHeader.ts";
import type {
  BodyTransform,
  ResponseTransform,
  TypedResponse,
} from "./responseHelper.ts";
import type {
  AnyResponseHeaderDefinition,
  ResponseHeaderDefinition,
} from "./responseHeader.ts";

const operationSymbol: unique symbol = Symbol();

export type OperationInput<
  QueryParameters extends Record<string, QueryDefinition<unknown>>,
  RequestHeaders extends ReadonlyArray<AnyRequestHeaderDefinition>,
  RequestBodyContent extends ReadonlyArray<AnyBodyDefinition>,
  Responses extends ReadonlyArray<AnyResponseDefinition>,
> = {
  readonly description?: string | undefined;
  readonly queryParameters?: QueryParameters | undefined;
  readonly requestHeaders?: RequestHeaders | undefined;
  readonly requestBody: {
    readonly description: string;
    readonly content: RequestBodyContent;
  } | undefined;
  readonly responses: Responses;
  readonly handler: CreateHandlerType<
    NoInfer<QueryParameters>,
    NoInfer<RequestHeaders>,
    NoInfer<RequestBodyContent>,
    NoInfer<Responses>
  >;
};

export type CreateHandlerType<
  QueryParameters extends Record<string, QueryDefinition<unknown>>,
  RequestHeaders extends ReadonlyArray<AnyRequestHeaderDefinition>,
  RequestBodyContent extends ReadonlyArray<AnyBodyDefinition>,
  Responses extends ReadonlyArray<AnyResponseDefinition>,
> = (
  request: {
    readonly queryParameters: {
      [k in keyof QueryParameters]: QueryParameters[k]["example"];
    };
    readonly headers: {
      readonly [
        requestHeader in RequestHeaders[number] as requestHeader["name"]
      ]: ReturnType<requestHeader["decode"]>;
    };
    readonly body: BodyTransform<RequestBodyContent[number]>;
    readonly response: ResponseTransform<Responses[number]> extends
      TypedResponse<
        infer S,
        infer H extends ReadonlyArray<AnyResponseHeaderDefinition>,
        infer B
      > ? {
        readonly [key in S]: (
          headers: {
            readonly [HItem in H[number] as HItem["name"]]: HItem extends
              ResponseHeaderDefinition<infer _, infer T> ? T : never;
          },
          mimeType: BodyTransform<B>["mimeType"],
          content: BodyTransform<B>["content"],
        ) => Promise<Response>;
      }
      : never;
  },
) => Promise<Response>;

export type OperationInternalWithBody = {
  readonly description: string | undefined;
  readonly queryParameters: {
    readonly [key: string]: QueryDefinition<unknown>;
  };
  readonly requestBody: {
    readonly description: string;
    readonly content: ReadonlyArray<AnyBodyDefinition>;
  } | undefined;
  readonly requestHeaders: ReadonlyArray<AnyRequestHeaderDefinition>;
  readonly responses: ReadonlyArray<AnyResponseDefinition>;
  readonly handler: (
    parameter: {
      readonly pathParameters: { readonly [key: string]: string };
      readonly queryParameters: { readonly [key: string]: unknown };
      readonly headers: Record<string, unknown>;
      readonly body:
        | {
          readonly mimeType: string;
          readonly content: unknown;
        }
        | undefined;
      readonly response: Record<
        string,
        (
          headers: Record<string, string>,
          mimeType: string,
          content: unknown,
        ) => unknown
      >;
    },
  ) => Promise<Response>;
  readonly [operationSymbol]: true;
};

export const operationWithBody = <
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<AnyRequestHeaderDefinition> =
    never,
  const RequestBodyContent extends ReadonlyArray<AnyBodyDefinition> = never,
  const Responses extends ReadonlyArray<AnyResponseDefinition> = never,
>(
  {
    description,
    queryParameters,
    requestHeaders,
    requestBody,
    responses,
    handler,
  }: OperationInput<
    QueryParameters,
    RequestHeaders,
    RequestBodyContent,
    Responses
  >,
): OperationInternalWithBody => ({
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
      readonly queryParameters: Record<string, unknown>;
      readonly body:
        | { readonly mimeType: string; readonly content: unknown }
        | undefined;
    },
  ) => Promise<Response>,
  [operationSymbol]: true,
});

export type OperationInternalWithoutBody = {
  readonly description: string | undefined;
  readonly queryParameters: {
    readonly [key: string]: QueryDefinition<unknown>;
  };
  readonly requestHeaders: ReadonlyArray<AnyRequestHeaderDefinition>;
  readonly responses: ReadonlyArray<AnyResponseDefinition>;
  readonly handler: (
    parameter: {
      readonly pathParameters: { readonly [key: string]: string };
      readonly queryParameters: { readonly [key: string]: unknown };
      readonly headers: Record<string, unknown>;
      readonly body:
        | {
          readonly mimeType: string;
          readonly content: unknown;
        }
        | undefined;
      readonly response: Record<
        string,
        (
          headers: Record<string, string>,
          mimeType: string,
          content: unknown,
        ) => unknown
      >;
    },
  ) => Promise<Response>;
  readonly [operationSymbol]: true;
};

export const operationWithoutBody = <
  const QueryParameters extends Record<string, QueryDefinition<unknown>> =
    never,
  const RequestHeaders extends ReadonlyArray<AnyRequestHeaderDefinition> =
    never,
  const Responses extends ReadonlyArray<AnyResponseDefinition> = never,
>(
  {
    description,
    queryParameters,
    requestHeaders,
    responses,
    handler,
  }: Omit<
    OperationInput<
      QueryParameters,
      RequestHeaders,
      [],
      Responses
    >,
    "requestBody"
  >,
): OperationInternalWithoutBody => ({
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
  responses,
  handler: handler as unknown as (
    request: {
      readonly queryParameters: Record<string, unknown>;
      readonly body:
        | { readonly mimeType: string; readonly content: unknown }
        | undefined;
    },
  ) => Promise<Response>,
  [operationSymbol]: true,
});
