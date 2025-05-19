import type { AnyBodyDefinition, BodyDefinition } from "./body.ts";
import type { AnyResponseDefinition, ResponseDefinition } from "./response.ts";
import type {
  AnyResponseHeaderDefinition,
  ResponseHeaderDefinition,
} from "./responseHeader.ts";

const typedResponseSymbol: unique symbol = Symbol();

export type ResponseTransform<
  T extends AnyResponseDefinition,
> = T extends ResponseDefinition<infer S, infer H, infer B>
  ? TypedResponse<S, H, B[number]>
  : `expected ResponseObjectDefinition<S, B>`;

export type TypedResponse<
  StatusCode extends string,
  Headers extends ReadonlyArray<AnyResponseHeaderDefinition>,
  BodyDefinitions extends AnyBodyDefinition,
> = {
  readonly statusCode: StatusCode;
  readonly headers: HeaderTransform<Headers[number]>;
  readonly content: BodyTransform<BodyDefinitions>;
  readonly [typedResponseSymbol]: typeof typedResponseSymbol;
};

export type BodyTransform<T extends AnyBodyDefinition> = T extends
  BodyDefinition<infer M, infer C>
  ? { readonly mimeType: M; readonly content: C }
  : `expected BodyDefinition<M, C>`;

export type HeaderTransform<T extends AnyResponseHeaderDefinition> = T extends
  ResponseHeaderDefinition<infer N, infer V> ? { readonly [k in N]: V }
  : `expected ResponseHeaderDefinition<N, V>`;

/**
 * 200
 * @see https://developer.mozilla.org/docs/Web/HTTP/Reference/Status/200
 */
export const ok = <
  const H extends ReadonlyArray<AnyResponseHeaderDefinition>,
  const B extends AnyBodyDefinition,
>(
  headers: HeaderTransform<H[number]>,
  mimeType: BodyTransform<B>["mimeType"],
  content: BodyTransform<B>["content"],
): TypedResponse<"200", H, B> => {
  return {
    statusCode: "200",
    headers,
    content: { mimeType, content } as BodyTransform<B>,
    [typedResponseSymbol]: typedResponseSymbol,
  };
};
