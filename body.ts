import { JsonDefinition } from "./json.ts";

const bodySymbol = Symbol();

export type BodyDefinition<
  MimeType extends string,
  Type extends unknown,
> = {
  readonly mimeType: MimeType;
  readonly decode: (request: Request) => Promise<Type>;
  readonly [bodySymbol]: typeof bodySymbol;
};

/**
 * `text/plain`
 */
export function textPlain(): BodyDefinition<
  "text/plain",
  string
> {
  return text("text/plain");
}

export function text<const MimeType extends string = never>(
  mimeType: MimeType,
): BodyDefinition<
  MimeType,
  string
> {
  return {
    mimeType,
    decode: async (request) => await request.text(),
    [bodySymbol]: bodySymbol,
  };
}

/**
 * `application/octet-stream`
 */
export function applicationOctetStream(): BodyDefinition<
  "application/octet-stream",
  Uint8Array
> {
  return binary("application/octet-stream");
}

export function binary<
  const MimeType extends string = never,
>(mimeType: MimeType): BodyDefinition<
  MimeType,
  Uint8Array
> {
  return {
    mimeType,
    decode: async (request) => await request.bytes(),
    [bodySymbol]: bodySymbol,
  };
}

/**
 * `application/json`
 */
export function applicationJson<T>(
  jsonDefinition: JsonDefinition<T>,
): BodyDefinition<
  "application/json",
  T
> {
  return {
    mimeType: "application/json",
    decode: async (request) => jsonDefinition.decode(await request.json()),
    [bodySymbol]: bodySymbol,
  };
}
