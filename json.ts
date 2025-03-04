import { SchemaObject } from "npm:openapi-typescript";

type JsonValue =
  | string
  | number
  | null
  | boolean
  | ReadonlyArray<JsonValue>
  | { readonly [key in string]: JsonValue };

const jsonTypeDefinitionSymbol = Symbol();

export type JsonDefinition<Type> = {
  decode: (json: JsonValue) => Type;
  encode: (t: Type) => JsonValue;
  jsonSchema: SchemaObject;
  [jsonTypeDefinitionSymbol]: typeof jsonTypeDefinitionSymbol;
};

export function string(): JsonDefinition<string> {
  return {
    decode: (json) => {
      if (typeof json === "string") {
        return json;
      }
      throw new Error("decode error expected string");
    },
    encode: (e) => {
      if (typeof e === "string") {
        return e;
      }
      throw new Error("encode error expected string");
    },
    jsonSchema: {
      type: "string",
    },
    [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
  };
}

/**
 * https://json-schema.org/understanding-json-schema/reference/numeric#integer
 */
export function integer(): JsonDefinition<number> {
  return {
    decode: (json) => {
      if (
        typeof json === "number" && !Number.isNaN(json) && json !== Infinity &&
        json !== -Infinity
      ) {
        return Math.floor(json);
      }
      throw new Error("decode error expected integer");
    },
    encode: (e) => {
      if (
        typeof e === "number" && !Number.isNaN(e) && e !== Infinity &&
        e !== -Infinity
      ) {
        return Math.floor(e);
      }
      throw new Error("encode error expected integer");
    },
    jsonSchema: {
      type: "integer",
    },
    [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
  };
}

/**
 * https://json-schema.org/understanding-json-schema/reference/numeric#number
 */
export function number(): JsonDefinition<number> {
  return {
    decode: (json) => {
      if (
        typeof json === "number" && !Number.isNaN(json) && json !== Infinity &&
        json !== -Infinity
      ) {
        return json;
      }
      throw new Error("decode error expected number");
    },
    encode: (e) => {
      if (
        typeof e === "number" && !Number.isNaN(e) && e !== Infinity &&
        e !== -Infinity
      ) {
        return e;
      }
      throw new Error("encode error expected number");
    },
    jsonSchema: {
      type: "number",
    },
    [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
  };
}

export function array<T>(itemSchema: JsonDefinition<T>): JsonDefinition<T[]> {
  return {
    decode: (json) => {
      if (Array.isArray(json)) {
        return json.map(itemSchema.decode);
      }
      throw new Error("decode error expected array");
    },
    encode: (e) => {
      if (Array.isArray(e)) {
        return e.map(itemSchema.encode);
      }
      throw new Error("encode error expected array");
    },
    jsonSchema: {
      type: "array",
      items: itemSchema.jsonSchema,
    },
    [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
  };
}

export const boolean: JsonDefinition<boolean> = {
  decode: (json) => {
    if (typeof json === "boolean") {
      return json;
    }
    throw new Error("decode error expected boolean");
  },
  encode: (e) => {
    if (typeof e === "boolean") {
      return e;
    }
    throw new Error("encode error expected boolean");
  },
  jsonSchema: {
    type: "boolean",
  },
  [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
};

export function object<T>(
  properties: { [K in keyof T]: JsonDefinition<T[K]> },
): JsonDefinition<T> {
  return {
    decode: (json) => {
      if (typeof json === "object" && json !== null && !Array.isArray(json)) {
        const result: any = {};
        for (const key in properties) {
          result[key] = properties[key].decode((json as any)[key]);
        }
        return result as T;
      }
      throw new Error("decode error expected object");
    },
    encode: (e) => {
      if (typeof e === "object" && e !== null && !Array.isArray(e)) {
        const result: any = {};
        for (const key in properties) {
          result[key] = properties[key].encode((e as any)[key]);
        }
        return result;
      }
      throw new Error("encode error expected object");
    },
    jsonSchema: {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(properties).map((
          [key, schema],
        ) => [key, (schema as JsonDefinition<unknown>).jsonSchema]),
      ),
    },
    [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
  };
}

const nullType: JsonDefinition<null> = {
  decode: (json) => {
    if (json === null) {
      return null;
    }
    throw new Error("decode error expected null");
  },
  encode: (e) => {
    if (e === null) {
      return null;
    }
    throw new Error("encode error expected null");
  },
  jsonSchema: {
    type: "null",
  },
  [jsonTypeDefinitionSymbol]: jsonTypeDefinitionSymbol,
};

export { nullType as null };
