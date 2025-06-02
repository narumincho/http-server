import {
  body,
  createHandler,
  createPathItem,
  json,
  operationWithoutBody,
  response,
} from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("path", async () => {
  const handler = createHandler({
    pathItem: createPathItem({
      get: operationWithoutBody({
        responses: [response.ok({
          headers: [],
          description: "",
          content: [body.applicationJson(json.string())],
        })],
        // deno-lint-ignore require-await
        handler: async ({ response }) => {
          return response["200"]({}, "application/json", "/");
        },
      }),
      subPath: {
        accounts: createPathItem({
          get: operationWithoutBody({
            responses: [response.ok({
              headers: [],
              description: "",
              content: [body.applicationJson(json.string())],
            })],
            // deno-lint-ignore require-await
            handler: async ({ response }) => {
              return response["200"]({}, "application/json", "/accounts");
            },
          }),
          subPathVariable: {
            variableName: "id",
            pathItem: createPathItem({
              get: operationWithoutBody({
                responses: [response.ok({
                  headers: [],
                  description: "",
                  content: [body.applicationJson(json.object({
                    path: json.string(),
                    pathParameters: json.object({
                      id: json.string(),
                    }),
                  }))] as const,
                })],
                // deno-lint-ignore require-await
                handler: async ({ response, pathParameters }) => {
                  return response["200"]({}, "application/json", {
                    path: "/accounts",
                    pathParameters: { id: pathParameters.id },
                  });
                },
              }),
            }),
          },
        }),
      },
    }),
  });

  assertEquals(
    await (await handler(
      new Request("https://example.com/"),
    )).json(),
    "/",
  );

  assertEquals(
    await (await handler(
      new Request("https://example.com/accounts"),
    )).json(),
    "/accounts",
  );

  assertEquals(
    await (await handler(
      new Request("https://example.com/accounts"),
    )).json(),
    "/accounts",
  );

  assertEquals(
    (await handler(
      new Request("https://example.com/unknonwn"),
    )).status,
    404,
  );
});
