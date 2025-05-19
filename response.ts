import type { AnyBodyDefinition } from "./body.ts";
import type { AnyResponseHeaderDefinition } from "./responseHeader.ts";

const responseObjectDefinitionSymbol: unique symbol = Symbol();

export type ResponseDefinition<
  StatusCode extends string,
  Headers extends ReadonlyArray<AnyResponseHeaderDefinition>,
  BodyDefinitions extends ReadonlyArray<AnyBodyDefinition>,
> = {
  readonly statusCode: StatusCode;
  readonly description: string;
  readonly headers: Headers;
  readonly content: BodyDefinitions;
  readonly [responseObjectDefinitionSymbol]:
    typeof responseObjectDefinitionSymbol;
};

export type AnyResponseDefinition = ResponseDefinition<
  string,
  ReadonlyArray<AnyResponseHeaderDefinition>,
  ReadonlyArray<AnyBodyDefinition>
>;

/**
 * status 200
 * @see https://developer.mozilla.org/docs/Web/HTTP/Reference/Status/200
 */
export function ok<
  const BodyDefinitions extends ReadonlyArray<AnyBodyDefinition> = never,
  const Headers extends ReadonlyArray<AnyResponseHeaderDefinition> = never,
>(
  { description, headers, content }: {
    readonly description: string;
    readonly headers: Headers;
    readonly content: BodyDefinitions;
  },
): ResponseDefinition<
  "200",
  Headers,
  BodyDefinitions
> {
  return {
    statusCode: "200",
    description,
    headers,
    content,
    [responseObjectDefinitionSymbol]: responseObjectDefinitionSymbol,
  };
}
