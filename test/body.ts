import type { Equal, Expect } from "npm:@type-challenges/utils";
import { assertEquals } from "jsr:@std/assert";
import { createHandler, createOperation, json, requestBody } from "../mod.ts";

Deno.test("body", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        requestBody: {
          description: "",
          content: [
            requestBody.textPlain(),
            requestBody.applicationOctetStream(),
            requestBody.applicationJson(json.object({
              a: json.string(),
            })),
          ] as const,
        },
        // deno-lint-ignore require-await
        handler: async ({ body }) => {
          type cases = [
            Expect<
              Equal<
                typeof body,
                {
                  mimeType: "text/plain";
                  content: string;
                } | {
                  mimeType: "application/octet-stream";
                  content: Uint8Array<ArrayBuffer>;
                } | {
                  mimeType: "application/json";
                  content: { a: string };
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

  const url = new URL("https://example.com/samplePath");
  url.searchParams.set("key", "value");
  url.searchParams.set("サンプルキー!", " &?=?&+");
  url.searchParams.set(" &?empty", "");
  url.searchParams.set("extra", "");
  assertEquals(
    await (await handler(new Request(url))).json(),
    {
      key: "value",
      "サンプルキー!": " &?=?&+",
      " &?empty": "",
    },
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

  const url = new URL("https://example.com/samplePath");
  url.searchParams.set("extra", "aaa");
  assertEquals(
    await (await handler(new Request(url))).json(),
    {},
  );
});
