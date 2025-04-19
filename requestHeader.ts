const requestHeaderDefinitionSymbol = Symbol();

export type RequestHeaderDefinition<
  Name extends string,
  T extends unknown,
> = {
  readonly name: Name;
  readonly required: boolean;
  readonly deprecated: boolean;
  readonly item: RequestHeaderItemDefinition<Name, T>;
  readonly decode: (value: string | undefined) => T;
  readonly [requestHeaderDefinitionSymbol]:
    typeof requestHeaderDefinitionSymbol;
};

export type RequestHeaderDefinitionExtend = RequestHeaderDefinition<
  string,
  unknown
>;

export function required<const Name extends string, const T>(
  itemDefinition: RequestHeaderItemDefinition<Name, T>,
  { deprecated = false }: { readonly deprecated?: boolean },
): RequestHeaderDefinition<Name, T> {
  return {
    name: itemDefinition.name,
    required: true,
    deprecated,
    item: itemDefinition,
    decode: (value) => {
      if (value === undefined) {
        throw new Error(`must be specified`);
      }
      return itemDefinition.decode(value);
    },
    [requestHeaderDefinitionSymbol]: requestHeaderDefinitionSymbol,
  };
}

export function optional<const Name extends string, const T>(
  itemDefinition: RequestHeaderItemDefinition<
    Name,
    T
  >,
  { deprecated = false }: { readonly deprecated?: boolean },
): RequestHeaderDefinition<
  Name,
  T | undefined
> {
  return {
    name: itemDefinition.name,
    required: false,
    deprecated,
    item: itemDefinition,
    decode: (value) => {
      if (value === undefined) {
        return undefined;
      }
      return itemDefinition.decode(value);
    },
    [requestHeaderDefinitionSymbol]: requestHeaderDefinitionSymbol,
  };
}

const requestHeaderItemDefinitionSymbol = Symbol();

// カンマ区切りのヘッダーのサポートをする? どれくらいのヘッダーがサポートしているのか. また Authorization は複数指定してはいけないらしい

export type RequestHeaderItemDefinition<
  Name extends string,
  T extends unknown,
> = {
  readonly name: Name;
  readonly description: string;
  readonly regexp: RegExp;
  readonly examples: Record<string, T>;
  // レスポンスヘッダー set-cookie だけ複数になる
  readonly decode: (value: string) => T;
  readonly [requestHeaderItemDefinitionSymbol]:
    typeof requestHeaderItemDefinitionSymbol;
};

/**
 * http://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Authorization
 */
export const authorizationBearer = (
  {}: Record<string | number | symbol, never>,
): RequestHeaderItemDefinition<"Authorization", string> => ({
  name: "Authorization",
  description: "",
  regexp: /^Bearer .+$/,
  examples: {},
  decode: (value) => {
    const matchResult = value.match(/^Bearer (.+)$/)?.[1];
    if (matchResult === undefined) {
      throw new Error("invalid Authorization Bearer value");
    }
    return matchResult;
  },
  [requestHeaderItemDefinitionSymbol]: requestHeaderItemDefinitionSymbol,
});
