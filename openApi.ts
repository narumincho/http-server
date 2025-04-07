import {
  InfoObject,
  OpenAPI3,
  ParameterObject,
  PathItemObject,
} from "npm:openapi-typescript";
import { OperationInternal } from "./operation.ts";
import { body, json, operation } from "./mod.ts";
import { ok } from "./responseObject.ts";

export function createOpenApiOperation({ handler }: {
  readonly handler: () => Promise<{
    readonly statusCode: "200";
    readonly content: {
      readonly mimeType: "application/json";
      readonly content: OpenAPI3;
    };
  }>;
}) {
  return operation.get({
    path: "/openapi",
    responses: [ok({
      description: "Open API schema",
      content: [body.applicationJson(json.object({
        openapi: json.string(),
      }))],
    })],
    handler,
  });
}

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
            Object.fromEntries<PathItemObject>(
              operations.map(
                (
                  operation,
                ): [string, PathItemObject] => [
                  operation.method.toLowerCase(),
                  {
                    parameters: [
                      ...Object.entries(operation.queryParameters).map(
                        ([name, queryParameter]): ParameterObject => ({
                          name,
                          in: "query",
                          description: queryParameter.description,
                          deprecated: queryParameter.deprecated,
                        }),
                      ),
                    ],
                  },
                ],
              ),
            ),
          ]),
        ),
      },
    },
  };
}
