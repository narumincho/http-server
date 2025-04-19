import { ExampleObject, MediaTypeObject } from "npm:openapi-typescript";
import { JsonDefinition } from "./json.ts";

const bodySymbol = Symbol();

export type BodyDefinition<
  MimeType extends string,
  Type extends unknown,
> = {
  readonly mimeType: MimeType;
  readonly decode: (request: Request) => Promise<Type>;
  readonly encode: (request: Type) => Promise<BodyInit>;
  readonly jsonSchema: MediaTypeObject;
  readonly [bodySymbol]: typeof bodySymbol;
};

// deno-lint-ignore no-explicit-any
export type AnyBodyDefinition = BodyDefinition<string, any>;

type Examples = {
  readonly [name: string]: ExampleObject;
};

/**
 * `text/plain`
 */
export const textPlain = (
  { examples = { sampleText: { value: "サンプルテキスト" } } }: {
    readonly examples?: Examples;
  },
): BodyDefinition<
  "text/plain",
  string
> => text({ mimeType: "text/plain", examples });

/**
 * `text/html`
 */
export const textHtml = (
  {
    examples = {
      sampleText: {
        value: "<!doctype html><html><head></head><body></body></html>",
      },
    },
  }: {
    readonly examples?: Examples;
  },
): BodyDefinition<
  "text/html",
  string
> => text({ mimeType: "text/html", examples });

export const text = <const MimeType extends string = never>(
  { mimeType, examples }: {
    readonly mimeType: MimeType;
    readonly examples: Examples;
  },
): BodyDefinition<
  MimeType,
  string
> => ({
  mimeType,
  decode: async (request) => await request.text(),
  // deno-lint-ignore require-await
  encode: async (text) => text,
  jsonSchema: { examples, schema: { type: "string" } },
  [bodySymbol]: bodySymbol,
});

/**
 * `application/octet-stream`
 */
export const applicationOctetStream = (): BodyDefinition<
  "application/octet-stream",
  Uint8Array
> => binary({ mimeType: "application/octet-stream" });

export const binary = <
  const MimeType extends string = never,
>({ mimeType }: { mimeType: MimeType }): BodyDefinition<
  MimeType,
  Uint8Array
> => ({
  mimeType,
  decode: async (request) => await request.bytes(),
  // deno-lint-ignore require-await
  encode: async (binary) => binary,
  jsonSchema: {},
  [bodySymbol]: bodySymbol,
});

/**
 * `application/json`
 */
export const applicationJson = <T>(
  jsonDefinition: JsonDefinition<T>,
): BodyDefinition<
  "application/json",
  T
> => ({
  mimeType: "application/json",
  decode: async (request) => jsonDefinition.decode(await request.json()),
  // deno-lint-ignore require-await
  encode: async (json) => JSON.stringify(json),
  jsonSchema: jsonDefinition.jsonSchema,
  [bodySymbol]: bodySymbol,
});
