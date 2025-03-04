const requestBodySymbol = Symbol();

export type RequestBodyDefinition<
  MimeType extends string,
  Type extends unknown,
> = {
  readonly mimeType: MimeType;
  readonly decode: () => Type;
  // TODO JSON などスキーマを含むパターン
  readonly [requestBodySymbol]: typeof requestBodySymbol;
};

/**
 * `text/plain`
 */
export function textPlain(): RequestBodyDefinition<"text/plain", string> {
  return {
    mimeType: "text/plain",
    decode: () => "",
    [requestBodySymbol]: requestBodySymbol,
  };
}

/**
 * `application/octet-stream`
 */
export function applicationOctetStream(): RequestBodyDefinition<
  "application/octet-stream",
  Uint8Array<ArrayBuffer>
> {
  return {
    mimeType: "application/octet-stream",
    decode: () => new Uint8Array(),
    [requestBodySymbol]: requestBodySymbol,
  };
}
