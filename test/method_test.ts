import {
  body,
  createHandler,
  createPathItem,
  json,
  operationWithoutBody,
  response,
} from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("Unrecognized method respond with the 501 status code", async () => {
  const handler = createHandler({
    pathItem: createPathItem({
      get: operationWithoutBody({
        responses: [response.ok({
          headers: [],
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
        // deno-lint-ignore require-await
        handler: async ({ response }) => {
          return response["200"]({}, "application/json", {});
        },
      }),
    }),
  });

  assertEquals(
    (await handler(
      new Request("https://example.com", { method: "AAA" }),
    )).status,
    501,
  );

  assertEquals(
    (await handler(
      new Request("https://example.com/samplePath", { method: "AAA" }),
    )).status,
    501,
  );
});

Deno.test("recognized method respond but not allowed for the target resource respond with 405 status code", async () => {
  const handler = createHandler({
    pathItem: createPathItem({
      get: operationWithoutBody({
        queryParameters: {},
        responses: [
          response.ok({
            headers: [],
            description: "",
            content: [body.applicationJson(json.object({}))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ response }) => {
          return response["200"]({}, "application/json", {});
        },
      }),
    }),
  });

  assertEquals(
    (await handler(
      new Request("https://example.com/", { method: "DELETE" }),
    )).status,
    405,
  );
});
