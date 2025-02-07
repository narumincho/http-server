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
export type Query<
  Type extends unknown,
> = {
  readonly description: string;
  readonly required: boolean;
  readonly deprecated: boolean;
  readonly example: Type;
  readonly typeHint: QueryValueType;
  readonly decode: (values: ReadonlyArray<string>) => Type;
  readonly [queryInternalSymbol]: typeof queryInternalSymbol;
};

export function queryString(
  { description, example, deprecated = false }: {
    readonly description: string;
    readonly example: string;
    readonly deprecated?: boolean | undefined;
  },
): Query<string> {
  return {
    description,
    example,
    typeHint: "string",
    required: true,
    deprecated,
    decode: (values) => {
      if (values.length > 1) {
        throw new Error("must be specified only once");
      }
      const value = values[0];
      if (typeof value !== "string") {
        throw new Error("must be specified");
      }
      return value;
    },
    [queryInternalSymbol]: queryInternalSymbol,
  };
}

export function queryOptionalString(
  { description, example, deprecated = false }: {
    readonly description: string;
    readonly example: string;
    readonly deprecated?: boolean | undefined;
  },
): Query<string | undefined> {
  return {
    description,
    example,
    typeHint: "string",
    required: false,
    deprecated,
    decode: (values) => {
      if (values.length > 1) {
        throw new Error("must be specified only once");
      }
      return values[0];
    },
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
): Query<number> {
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
): Query<Required, "float"> {
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
): Query<Required, "boolean"> {
  return {
    description,
    example,
    type: "boolean",
    required,
    deprecated,
    [queryInternalSymbol]: queryInternalSymbol,
  };
}
