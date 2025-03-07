import { InfoObject, OpenAPI3 } from "npm:openapi-typescript";
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
      content: [body.applicationJson(json.object({}))],
    })],
    handler,
  });
}

export function createOpenApi({ info }: {
  readonly info: InfoObject;
  readonly paths: ReadonlyArray<OperationInternal>;
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
      },
    },
  };
}
