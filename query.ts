export type QueryValueType =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "enum";

const queryDefinitionSymbol = Symbol();

export type QueryValueTypeToTsType<type extends QueryValueType> = {
  string: string;
  integer: number;
  float: number;
  boolean: boolean;
  enum: string;
}[type];

/**
 * created by {@link string}
 */
export type QueryDefinition<
  Type extends unknown,
> = {
  readonly description: string;
  readonly deprecated: boolean;
  readonly example: Type;
  readonly queryBaseType: QueryBaseType;
  readonly typeHint: QueryValueType;
  readonly decode: (values: ReadonlyArray<string>) => Type;
  readonly [queryDefinitionSymbol]: typeof queryDefinitionSymbol;
};

type QueryBaseType = "required" | "optional" | "array";

const queryItemDefinitionSymbol = Symbol();

export type QueryItemDefinition<in out T> = {
  readonly typeHint: QueryValueType;
  readonly decode: (value: string) => T;
  readonly [queryItemDefinitionSymbol]: typeof queryItemDefinitionSymbol;
};

export function required<const T>(
  { description, example, queryItemType }: {
    readonly description: string;
    readonly example: T;
    readonly queryItemType: QueryItemDefinition<T>;
  },
): QueryDefinition<T> {
  return {
    description,
    queryBaseType: "required",
    deprecated: false,
    example,
    decode: (values) => {
      if (values.length > 1) {
        throw new Error("must be specified only once");
      }
      const value = values[0];
      if (typeof value !== "string") {
        throw new Error("must be specified");
      }
      return queryItemType.decode(value);
    },
    typeHint: queryItemType.typeHint,
    [queryDefinitionSymbol]: queryDefinitionSymbol,
  };
}

export function optional<const T>(
  { description, deprecated = false, example, queryItemType }: {
    readonly description: string;
    /**
     * @default false
     */
    readonly deprecated?: boolean | undefined;
    readonly example: T;
    readonly queryItemType: QueryItemDefinition<T>;
  },
): QueryDefinition<T | undefined> {
  return {
    description,
    queryBaseType: "optional",
    deprecated,
    example,
    decode: (values) => {
      if (values.length > 1) {
        throw new Error("must be specified only once");
      }
      const value = values[0];
      if (value === undefined) {
        return undefined;
      }
      return queryItemType.decode(value);
    },
    typeHint: queryItemType.typeHint,
    [queryDefinitionSymbol]: queryDefinitionSymbol,
  };
}

export function array<const T>(
  { description, deprecated, example, queryItemType }: {
    readonly description: string;
    readonly deprecated: boolean;
    readonly example: ReadonlyArray<T>;
    readonly queryItemType: QueryItemDefinition<T>;
  },
): QueryDefinition<ReadonlyArray<T>> {
  return {
    description,
    queryBaseType: "optional",
    deprecated,
    example,
    decode: (values) => values.map((v) => queryItemType.decode(v)),
    typeHint: queryItemType.typeHint,
    [queryDefinitionSymbol]: queryDefinitionSymbol,
  };
}

export function string(): QueryItemDefinition<string> {
  return {
    typeHint: "string",
    decode: (value) => value,
    [queryItemDefinitionSymbol]: queryItemDefinitionSymbol,
  };
}

export function integer(): QueryItemDefinition<number> {
  return {
    typeHint: "integer",
    decode: (value) => Number.parseInt(value, 10),
    [queryItemDefinitionSymbol]: queryItemDefinitionSymbol,
  };
}

export function float(): QueryItemDefinition<number> {
  return {
    typeHint: "float",
    decode: (value) => Number.parseFloat(value),
    [queryItemDefinitionSymbol]: queryItemDefinitionSymbol,
  };
}

export function boolean(): QueryItemDefinition<boolean> {
  return {
    typeHint: "boolean",
    decode: (value) => value !== "false",
    [queryItemDefinitionSymbol]: queryItemDefinitionSymbol,
  };
}

function queryEnum<const T extends string>(
  values: ReadonlyArray<T>,
): QueryItemDefinition<T> {
  return {
    typeHint: "enum",
    decode: (value) => {
      const stringValues: ReadonlyArray<string> = values;
      if (!stringValues.includes(value)) {
        throw new Error("invalid value");
      }
      return value as T;
    },
    [queryItemDefinitionSymbol]: queryItemDefinitionSymbol,
  };
}

export { queryEnum as enum };
