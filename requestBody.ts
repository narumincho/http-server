import { JsonDefinition } from "./json.ts";

const requestBodySymbol = Symbol();

export type RequestBodyDefinition<
  MimeType extends string,
  Type extends unknown,
> = {
  readonly mimeType: MimeType;
  readonly decode: (request: Request) => Promise<Type>;
  // TODO JSON などスキーマを含むパターン
  readonly [requestBodySymbol]: typeof requestBodySymbol;
};

/**
 * `text/plain`
 */
export function textPlain(): RequestBodyDefinition<
  "text/plain",
  string
> {
  return text("text/plain");
}

export function text<const MimeType extends string = never>(
  mimeType: MimeType,
): RequestBodyDefinition<
  MimeType,
  string
> {
  return {
    mimeType,
    decode: async (request) => await request.text(),
    [requestBodySymbol]: requestBodySymbol,
  };
}

/**
 * `application/octet-stream`
 */
export function applicationOctetStream(): RequestBodyDefinition<
  "application/octet-stream",
  Uint8Array
> {
  return binary("application/octet-stream");
}

export function binary<
  const MimeType extends string = never,
>(mimeType: MimeType): RequestBodyDefinition<
  MimeType,
  Uint8Array
> {
  return {
    mimeType,
    decode: async (request) => await request.bytes(),
    [requestBodySymbol]: requestBodySymbol,
  };
}

/**
 * `application/json`
 */
export function applicationJson<T>(
  jsonDefinition: JsonDefinition<T>,
): RequestBodyDefinition<
  "application/json",
  T
> {
  return {
    mimeType: "application/json",
    decode: async (request) => jsonDefinition.decode(await request.json()),
    [requestBodySymbol]: requestBodySymbol,
  };
}
