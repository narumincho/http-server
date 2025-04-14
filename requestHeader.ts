const requestHeaderSymbol = Symbol();

export type RequestHeaderDefinition<
  Required extends boolean,
  T extends unknown,
> = {
  readonly name: string;
  readonly description: string;
  readonly required: Required;
  readonly deprecated: boolean;
  readonly regexp: RegExp;
  readonly examples: {};
  readonly decode: (value: string | undefined) => T;
  readonly [requestHeaderSymbol]: typeof requestHeaderSymbol;
};

/**
 * http://developer.mozilla.org/docs/Web/HTTP/Reference/Headers/Authorization
 */
export const authorizationBearer = <
  const Required extends boolean,
>({ required, deprecated = false }: {
  readonly required: Required;
  /**
   * @default false
   */
  readonly deprecated?: boolean | undefined;
}): RequestHeaderDefinition<
  Required,
  Required extends true ? string : string | undefined
> => ({
  name: "Authorization",
  description: "",
  required,
  deprecated,
  regexp: /^Bearer .+$/,
  examples: {},
  decode: (value) => {
    if (required && value === undefined) {
      throw new Error("value is undefined");
    }
    return value as Required extends true ? string : string | undefined;
  },
  [requestHeaderSymbol]: requestHeaderSymbol,
});
