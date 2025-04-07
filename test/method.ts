import { body, createHandler, json, operation, response } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("Unrecognized method respond with the 501 status code", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
        responses: [response.ok({
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
        // deno-lint-ignore require-await
        handler: async () => {
          return {
            statusCode: "200",
            content: {
              mimeType: "application/json",
              content: {},
            },
          } as const;
        },
      }),
    ],
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
    operations: [
      operation.get({
        path: "/samplePath",
        queryParameters: {},
        responses: [
          response.ok({
            description: "",
            content: [body.applicationJson(json.object({}))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async () => {
          return {
            statusCode: "200",
            content: {
              mimeType: "application/json",
              content: {},
            },
          } as const;
        },
      }),
    ],
  });

  assertEquals(
    (await handler(
      new Request("https://example.com/samplePath", { method: "DELETE" }),
    )).status,
    405,
  );
});
