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
import {
  type CreateHandlerType,
  type OperationInternalWithBody,
  type OperationInternalWithoutBody,
  operationWithBody,
  operationWithoutBody,
} from "./operation.ts";
import { body, json, response } from "./mod.ts";
import { createPathItem, type PathItem } from "./pathItem.ts";

export const createOpenApiPathItem = ({ handler }: {
  readonly handler: CreateHandlerType<
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
    get: operationWithoutBody({
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
    paths: pathItemToOperationObject(pathItem),
  };
}

const pathItemToOperationObject = (
  pathItem: PathItem,
): PathsObject => {
  return Object.fromEntries(pathItemToOperationObjectLoop("", pathItem));
};

const pathItemToOperationObjectLoop = (
  prefix: string,
  pathItem: PathItem,
): ReadonlyArray<readonly [string, PathItemObject]> => {
  const subPaths: ReadonlyArray<readonly [string, PathItemObject]> = Object
    .entries(pathItem.subPath ?? {}).flatMap((
      [name, subPathItem],
    ) => (
      pathItemToOperationObjectLoop(
        `${prefix}/${name}`,
        subPathItem,
      )
    ));
  if (
    pathItem.get || pathItem.post || pathItem.put || pathItem.patch ||
    pathItem.delete || pathItem.options || pathItem.head
  ) {
    return [
      [prefix ? prefix : "/", {
        ...(pathItem.get ? { get: operationToObject(pathItem.get) } : {}),
        ...(pathItem.post ? { post: operationToObject(pathItem.post) } : {}),
        ...(pathItem.put ? { put: operationToObject(pathItem.put) } : {}),
        ...(pathItem.patch ? { patch: operationToObject(pathItem.patch) } : {}),
        ...(pathItem.delete
          ? { delete: operationToObject(pathItem.delete) }
          : {}),
        ...(pathItem.options
          ? { options: operationToObject(pathItem.options) }
          : {}),
        ...(pathItem.head ? { head: operationToObject(pathItem.head) } : {}),
      }],
      ...subPaths,
    ];
  }
  return subPaths;
};

const operationToObject = (
  operation: OperationInternalWithBody | OperationInternalWithoutBody,
): OperationObject => {
  const requestBody: RequestBodyObject | undefined =
    "requestBody" in operation && operation.requestBody
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
