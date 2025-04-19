import type { AnyBodyDefinition } from "./body.ts";

const responseObjectDefinitionSymbol: unique symbol = Symbol();

export type ResponseObjectDefinition<
  StatusCode extends string,
  BodyDefinitions extends ReadonlyArray<AnyBodyDefinition>,
> = {
  readonly statusCode: StatusCode;
  readonly description: string;
  readonly content: BodyDefinitions;
  readonly [responseObjectDefinitionSymbol]:
    typeof responseObjectDefinitionSymbol;
};

/**
 * status 200
 */
export function ok<
  const BodyDefinitions extends ReadonlyArray<AnyBodyDefinition> = never,
>(
  { description, content }: {
    readonly description: string;
    readonly content: BodyDefinitions;
  },
): ResponseObjectDefinition<
  "200",
  BodyDefinitions
> {
  return {
    statusCode: "200",
    description,
    content,
    [responseObjectDefinitionSymbol]: responseObjectDefinitionSymbol,
  };
}
