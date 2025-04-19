import {
  InfoObject,
  MediaTypeObject,
  OpenAPI3,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from "openapi-typescript";
import { OperationInternal } from "./operation.ts";
import { body, json, operation, response } from "./mod.ts";

export const createOpenApiOperation = ({ path, handler }: {
  readonly path: string;
  readonly handler: () => Promise<{
    readonly statusCode: "200";
    readonly content: {
      readonly mimeType: "application/json";
      readonly content: OpenAPI3;
    };
  }>;
}): OperationInternal =>
  operation.get({
    path,
    responses: [response.ok({
      description: "Open API schema",
      content: [body.applicationJson(json.object({
        openapi: json.string(),
      }))],
    })],
    handler,
  });

export function createOpenApi({ info, operations: paths }: {
  readonly info: InfoObject;
  readonly operations: ReadonlyArray<OperationInternal>;
}): {
  readonly statusCode: "200";
  readonly content: {
    readonly mimeType: "application/json";
    readonly content: OpenAPI3;
  };
} {
  return {
    statusCode: "200",
    content: {
      mimeType: "application/json",
      content: {
        openapi: "3.1.1",
        info,
        paths: Object.fromEntries(
          [...Map.groupBy(paths, (path) => path.path)].map((
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
      },
    },
  };
}

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
