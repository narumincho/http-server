export type QueryValueType = "string" | "integer" | "float" | "boolean";

const queryInternalSymbol = Symbol();

export type QueryValueTypeToTsType<type extends QueryValueType> = {
  string: string;
  integer: number;
  float: number;
  boolean: boolean;
}[type];

/**
 * created by {@link queryString}
 */
export type QueryInternal<
  Required extends boolean,
  Type extends QueryValueType,
> = {
  readonly description: string;
  readonly required: Required;
  readonly deprecated: boolean;
  readonly example: QueryValueTypeToTsType<Type>;
  readonly type: Type;
  readonly [queryInternalSymbol]: typeof queryInternalSymbol;
};

export function queryString<Required extends boolean>(
  { description, example, required, deprecated = false }: {
    readonly description: string;
    readonly example: string;
    readonly required: Required;
    readonly deprecated?: boolean | undefined;
  },
): QueryInternal<Required, "string"> {
  return {
    description,
    example,
    type: "string",
    required,
    deprecated,
    [queryInternalSymbol]: queryInternalSymbol,
  };
}

export function queryInteger<Required extends boolean>(
  { description, example, required, deprecated = false }: {
    readonly description: string;
    readonly example: number;
    readonly required: Required;
    readonly deprecated?: boolean | undefined;
  },
): QueryInternal<Required, "integer"> {
  return {
    description,
    example,
    type: "integer",
    required,
    deprecated,
    [queryInternalSymbol]: queryInternalSymbol,
  };
}

export function queryFloat<Required extends boolean>(
  { description, example, required, deprecated = false }: {
    readonly description: string;
    readonly example: number;
    readonly required: Required;
    readonly deprecated?: boolean | undefined;
  },
): QueryInternal<Required, "float"> {
  return {
    description,
    example,
    type: "float",
    required,
    deprecated,
    [queryInternalSymbol]: queryInternalSymbol,
  };
}

export function queryBoolean<Required extends boolean>(
  { description, example = true, required, deprecated = false }: {
    readonly description: string;
    /**
     * @default true
     */
    readonly example?: boolean;
    readonly required: Required;
    /**
     * @default false
     */
    readonly deprecated?: boolean | undefined;
  },
): QueryInternal<Required, "boolean"> {
  return {
    description,
    example,
    type: "boolean",
    required,
    deprecated,
    [queryInternalSymbol]: queryInternalSymbol,
  };
}
