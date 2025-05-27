import type {
  InfoObject,
  MediaTypeObject,
  OpenAPI3,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from "openapi-typescript";
import type { OperationInternal } from "./operation.ts";
import { body, json, operation, response } from "./mod.ts";
import { createPathItem, type PathItem } from "./pathItem.ts";

export const createOpenApiOperation = ({ handler }: {
  readonly handler: operation.CreateHandlerType<
    never,
    never,
    never,
    NoInfer<
      readonly [
        response.ResponseDefinition<
          "200",
          readonly [],
          readonly [
            body.BodyDefinition<"application/json", {
              openapi: string;
            }>,
          ]
        >,
      ]
    >
  >;
}): PathItem =>
  createPathItem({
    get: operation.createOperation({
      responses: [response.ok({
        description: "Open API schema",
        headers: [],
        content: [body.applicationJson(json.object({
          openapi: json.string(),
        }))],
      })],
      handler,
    }),
  });

export function createOpenApi({ info, pathItem }: {
  readonly info: InfoObject;
  readonly pathItem: PathItem;
}): OpenAPI3 {
  return {
    openapi: "3.1.1",
    info,
    paths: Object.fromEntries(
      [...pathItem].map((
        [path, operations],
      ) => [
        path,
        Object.fromEntries<OperationObject>(
          operations.map(
            (
              operation,
            ): [string, OperationObject] => [
              operation.method.toLowerCase(),
              operationToObject(operation),
            ],
          ),
        ),
      ]),
    ),
  };
}

const pathItemToOperationObject = (
  prefix: string,
  pathItem: PathItem,
): PathsObject => {
  // TODO
  return {
    ...pathItem.get || pathItem.post || pathItem.put || pathItem.patch ||
        pathItem.delete || pathItem.options || pathItem.head
      ? {
        [prefix ? prefix : "/"]: {
          ...(pathItem.get ? { get: operationToObject(pathItem.get) } : {}),
          ...(pathItem.post ? { post: operationToObject(pathItem.post) } : {}),
          ...(pathItem.put ? { put: operationToObject(pathItem.put) } : {}),
          ...(pathItem.patch
            ? { patch: operationToObject(pathItem.patch) }
            : {}),
          ...(pathItem.delete
            ? { delete: operationToObject(pathItem.delete) }
            : {}),
          ...(pathItem.options
            ? { options: operationToObject(pathItem.options) }
            : {}),
          ...(pathItem.head ? { head: operationToObject(pathItem.head) } : {}),
        },
      }
      : {},
    ...Object.entries(pathItem.subPath ?? {}).flatMap((
      [name, subPathItem],
    ) => ({
      [`${prefix}/${name}`]: pathItemToOperationObject(
        `${prefix}/${name}`,
        subPathItem,
      ),
    })),
  };
};

const operationToObject = (operation: OperationInternal): OperationObject => {
  const requestBody: RequestBodyObject | undefined = operation.requestBody
    ? {
      description: operation.requestBody.description,
      content: Object.fromEntries<MediaTypeObject>(
        operation.requestBody.content.map(
          (body): [string, MediaTypeObject] => [
            body.mimeType,
            body.jsonSchema,
          ],
        ),
      ),
    }
    : undefined;

  return {
    ...(operation.description ? { description: operation.description } : {}),
    parameters: [
      ...Object.entries(operation.queryParameters).map(
        ([name, queryParameter]): ParameterObject => ({
          name,
          in: "query",
          description: queryParameter.description,
          deprecated: queryParameter.deprecated,
        }),
      ),
      ...operation.requestHeaders.map((requestHeader): ParameterObject => ({
        in: "header",
        name: requestHeader.name,
        description: requestHeader.item.description,
        deprecated: requestHeader.deprecated,
        required: requestHeader.required,
        // examples: requestHeader.item.examples,
        schema: {
          type: "string",
          pattern: requestHeader.item.regexp.source,
        } as SchemaObject,
      })),
    ],
    ...(requestBody ? { requestBody } : {}),
    responses: Object.fromEntries(operation.responses.map(
      (response): [string, ResponseObject] => [response.statusCode, {
        description: response.description,
        content: Object.fromEntries<MediaTypeObject>(
          response.content.map(
            (
              body,
            ): [string, MediaTypeObject] => [body.mimeType, body.jsonSchema],
          ),
        ),
      }],
    )),
  };
};
