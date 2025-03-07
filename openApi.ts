import { OpenAPI3 } from "npm:openapi-typescript";
import { OperationInternal } from "./operation.ts";
import { operation } from "./mod.ts";

export function createOpenApiOperation({ handler }: {
  readonly handler: () => OpenAPI3;
}) {
  return operation.get({
    path: "/openapi",
    handler,
  });
}

export function createOpenApiOperationHandler({ paths }: {
  readonly paths: ReadonlyArray<OperationInternal>;
}): () => OpenAPI3 {
  const openApiOperationHandler = (): OpenAPI3 => {
    return {
      openapi: "3.1.1",
      info: {
        title: "",
      },
    };
  };
  return openApiOperationHandler;
}
