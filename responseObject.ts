import { BodyDefinition } from "./body.ts";

const responseObjectDefinitionSymbol = Symbol();

export type ResponseObjectDefinition<
  StatusCode extends string,
  BodyDefinitions extends ReadonlyArray<BodyDefinition<string, unknown>>,
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
  const BodyDefinitions extends ReadonlyArray<BodyDefinition<string, unknown>> =
    never,
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
