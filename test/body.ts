import type { Equal, Expect } from "npm:@type-challenges/utils";
import { assertEquals } from "jsr:@std/assert";
import { body, createHandler, createOperation, json } from "../mod.ts";

Deno.test("body", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "POST",
        requestBody: {
          description: "",
          content: [
            body.textPlain(),
            body.applicationOctetStream(),
            body.applicationJson(json.object({
              a: json.string(),
            })),
          ],
        },
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
          return new Response(JSON.stringify(body), {
            headers: {
              "content-type": "application/json",
            },
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
    "sampleText",
  );
});

Deno.test("body empty", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
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
          return new Response(JSON.stringify(body), {
            headers: {
              "content-type": "application/json",
            },
          });
        },
      }),
    ],
  });

  assertEquals(
    await (await handler(new Request("https://example.com/samplePath"))).json(),
    null,
  );
});

Deno.test("body unexpected Content-Type", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "POST",
        requestBody: {
          description: "",
          content: [
            body.textPlain(),
          ],
        },
        // deno-lint-ignore require-await
        handler: async ({ body }) => {
          type cases = [
            Expect<
              Equal<
                typeof body,
                {
                  readonly mimeType: "text/plain";
                  readonly content: string;
                }
              >
            >,
          ];
          return new Response(JSON.stringify(body), {
            headers: {
              "content-type": "application/json",
            },
          });
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
