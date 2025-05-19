import type { Equal, Expect } from "npm:@type-challenges/utils";
import { assertEquals } from "jsr:@std/assert";
import { body, createHandler, json, operation, response } from "../mod.ts";

Deno.test("body", async () => {
  const handler = createHandler({
    operations: [
      operation.post({
        path: "/samplePath",
        requestBody: {
          description: "",
          content: [
            body.textPlain({}),
            body.applicationOctetStream(),
            body.applicationJson(json.object({
              a: json.string(),
            })),
          ],
        },
        responses: [
          response.ok({
            headers: [],
            description: "",
            content: [body.applicationJson(json.object({ a: json.string() }))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ body, response }) => {
          type cases = [
            Expect<
              Equal<
                typeof body,
                {
                  readonly mimeType: "text/plain";
                  readonly content: string;
                } | {
                  readonly mimeType: "application/octet-stream";
                  readonly content: Uint8Array;
                } | {
                  readonly mimeType: "application/json";
                  readonly content: { a: string };
                }
              >
            >,
          ];
          return response["200"]({}, "application/json", {
            a: body.content.toString(),
          });
        },
      }),
    ],
  });

  assertEquals(
    await (await handler(
      new Request("https://example.com/samplePath", {
        method: "POST",
        body: "sampleText",
        headers: {
          "content-type": "text/plain",
        },
      }),
    )).json(),
    { a: "sampleText" },
  );
});

Deno.test("body empty", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
        responses: [
          response.ok({
            headers: [],
            description: "",
            content: [body.applicationJson(json.object({}))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ body, response }) => {
          type cases = [
            Expect<
              Equal<
                typeof body,
                never
              >
            >,
          ];
          return response["200"]({}, "application/json", body);
        },
      }),
    ],
  });

  assertEquals(
    await (await handler(new Request("https://example.com/samplePath"))).text(),
    "",
  );
});

Deno.test("body unexpected Content-Type", async () => {
  const handler = createHandler({
    operations: [
      operation.post({
        path: "/samplePath",
        requestBody: {
          description: "",
          content: [
            body.textPlain({}),
          ],
        },
        responses: [
          response.ok({
            headers: [],
            description: "",
            content: [body.applicationJson(json.object({}))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ body: _body, response }) => {
          type cases = [
            Expect<
              Equal<
                typeof _body,
                {
                  readonly mimeType: "text/plain";
                  readonly content: string;
                }
              >
            >,
          ];
          return response["200"]({}, "application/json", {});
        },
      }),
    ],
  });

  assertEquals(
    (await handler(
      new Request("https://example.com/samplePath", {
        method: "POST",
        body: JSON.stringify({ a: "sampleText" }),
        headers: {
          "content-type": "application/xml",
        },
      }),
    )).status,
    415,
  );
});
