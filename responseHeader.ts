const responseHeaderDefinitionSymbol: unique symbol = Symbol();

export type ResponseHeaderDefinition<
  Name extends string,
  T extends unknown,
> = {
  readonly name: Name;
  readonly required: boolean;
  readonly deprecated: boolean;
  // deno-lint-ignore no-explicit-any
  readonly item: ResponseHeaderItemDefinition<Name, any>;
  readonly encode: (value: T) => string | undefined;
  readonly [responseHeaderDefinitionSymbol]:
    typeof responseHeaderDefinitionSymbol;
};

export type AnyResponseHeaderDefinition = ResponseHeaderDefinition<
  string,
  never
>;

export function required<const Name extends string, const T>(
  itemDefinition: ResponseHeaderItemDefinition<Name, T>,
  { deprecated = false }: { readonly deprecated?: boolean },
): ResponseHeaderDefinition<Name, T> {
  return {
    name: itemDefinition.name,
    required: true,
    deprecated,
    item: itemDefinition,
    encode: (value) => {
      return itemDefinition.encode(value);
    },
    [responseHeaderDefinitionSymbol]: responseHeaderDefinitionSymbol,
  };
}

export function optional<const Name extends string, const T>(
  itemDefinition: ResponseHeaderItemDefinition<
    Name,
    T
  >,
  { deprecated = false }: { readonly deprecated?: boolean },
): ResponseHeaderDefinition<
  Name,
  T | undefined
> {
  return {
    name: itemDefinition.name,
    required: false,
    deprecated,
    item: itemDefinition,
    encode: (value) => {
      if (value === undefined) {
        return undefined;
      }
      return itemDefinition.encode(value);
    },
    [responseHeaderDefinitionSymbol]: responseHeaderDefinitionSymbol,
  };
}

const responseHeaderItemDefinitionSymbol: unique symbol = Symbol();

// カンマ区切りのヘッダーのサポートをする? set-cookie のみの例外らしい

export type ResponseHeaderItemDefinition<
  Name extends string,
  T extends unknown,
> = {
  readonly name: Name;
  readonly description: string;
  readonly regexp: RegExp;
  readonly examples: Record<string, T>;
  // レスポンスヘッダー set-cookie だけ複数になる
  readonly encode: (value: T) => string;
  readonly [responseHeaderItemDefinitionSymbol]:
    typeof responseHeaderItemDefinitionSymbol;
};

/**
 * https://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin
 */
export function accessControlAllowOrigin(): ResponseHeaderItemDefinition<
  "Access-Control-Allow-Origin",
  string
> {
  return {
    name: "Access-Control-Allow-Origin",
    description: "",
    encode: (value) => value,
    regexp: /^(https?:\/\/[^/]+|\*)$/,
    examples: {},
    [responseHeaderItemDefinitionSymbol]: responseHeaderItemDefinitionSymbol,
  };
}

/**
 * https://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Headers
 */
export function accessControlAllowHeaders(): ResponseHeaderItemDefinition<
  "Access-Control-Allow-Headers",
  ReadonlyArray<"Content-Type" | "Authorization">
> {
  return {
    name: "Access-Control-Allow-Headers",
    description: "",
    encode: (value) => value.join(", "),
    regexp:
      /^([!#$%&'*+\-.^_`|~0-9A-Za-z]+)(\s*,\s*[!#$%&'*+\-.^_`|~0-9A-Za-z]+)*$/,
    examples: {},
    [responseHeaderItemDefinitionSymbol]: responseHeaderItemDefinitionSymbol,
  };
}

/**
 * https://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Methods
 */
export function accessControlAllowMethods(): ResponseHeaderItemDefinition<
  "Access-Control-Allow-Methods",
  ReadonlyArray<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS">
> {
  return {
    name: "Access-Control-Allow-Methods",
    description: "",
    encode: (value) => value.join(", "),
    regexp:
      /^([!#$%&'*+\-.^_`|~0-9A-Za-z]+)(\s*,\s*[!#$%&'*+\-.^_`|~0-9A-Za-z]+)*$/,
    examples: {},
    [responseHeaderItemDefinitionSymbol]: responseHeaderItemDefinitionSymbol,
  };
}
