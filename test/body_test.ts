import type { Equal, Expect } from "npm:@type-challenges/utils";
import { assertEquals } from "jsr:@std/assert";
import {
  body,
  createHandler,
  json,
  operation,
  response,
  responseHelper,
} from "../mod.ts";

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
            description: "",
            content: [body.applicationJson(json.object({ a: json.string() }))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ body }) => {
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
          return responseHelper.ok("application/json", {
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
            description: "",
            content: [body.applicationJson(json.object({}))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ body }) => {
          type cases = [
            Expect<
              Equal<
                typeof body,
                never
              >
            >,
          ];
          return responseHelper.ok("application/json", body);
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
            description: "",
            content: [body.applicationJson(json.object({}))],
          }),
        ],
        // deno-lint-ignore require-await
        handler: async ({ body: _body }) => {
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
          return responseHelper.ok("application/json", {});
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
