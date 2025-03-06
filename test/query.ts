import { assertEquals } from "jsr:@std/assert";
import { spy } from "jsr:@std/testing/mock";
import { createHandler, createOperation } from "../mod.ts";
import { query } from "../mod.ts";
import { Equal, Expect } from "npm:@type-challenges/utils";

Deno.test("query parameter", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        queryParameters: {
          key: query.required({
            description: "",
            queryItemType: query.string(),
            example: "キー",
          }),
          "サンプルキー!": query.optional({
            description: "",
            queryItemType: query.string(),
            example: "サンプルキーの例",
          }),
          " &?empty": query.optional({
            description: "",
            queryItemType: query.string(),
            example: "こんなクエリ名を指定することはまずないけど",
          }),
        },
        // deno-lint-ignore require-await
        handler: async ({ queryParameters }) => {
          type cases = [
            Expect<
              Equal<
                typeof queryParameters,
                {
                  readonly key: string;
                  readonly "\u30B5\u30F3\u30D7\u30EB\u30AD\u30FC!":
                    | string
                    | undefined;
                  readonly " &?empty": string | undefined;
                }
              >
            >,
          ];
          return new Response(JSON.stringify(queryParameters), {
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

Deno.test("query parameter empty", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        // deno-lint-ignore require-await
        handler: async ({ queryParameters }) => {
          type cases = [
            Expect<
              Equal<
                typeof queryParameters,
                never
              >
            >,
          ];
          return new Response(JSON.stringify(queryParameters), {
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

Deno.test("query parameter required", async () => {
  const samplePathHandler = spy<
    void,
    [{
      readonly pathParameters: Record<string, Record<string, unknown>>;
      readonly queryParameters: {
        a: string | undefined;
        b: string | undefined;
        c: string | undefined;
        d: string | undefined;
        e: string | undefined;
        enum: "A" | "B" | "C" | undefined;
      };
    }],
    Promise<Response>
  > // deno-lint-ignore require-await
  (async () => new Response());

  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        queryParameters: {
          a: query.required({
            description: "",
            example: "A",
            queryItemType: query.string(),
          }),
          b: query.required({
            description: "",
            queryItemType: query.string(),
            example: "B",
          }),
          c: query.required({
            description: "",
            example: "C",
            queryItemType: query.string(),
          }),
          d: query.required({
            description: "",
            example: "D",
            queryItemType: query.string(),
          }),
          e: query.optional({
            description: "",
            example: "E",
            queryItemType: query.string(),
          }),
          enum: query.optional({
            description: "",
            example: "A",
            queryItemType: query.enum(["A", "B", "C"]),
          }),
        },
        handler: samplePathHandler,
      }),
    ],
  });

  const url = new URL("https://example.com/samplePath");
  url.searchParams.set("a", "A");
  url.searchParams.set("b", "B");

  const response = await handler(new Request(url));
  // assertSpyCall(samplePathHandler, 0);
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errors: [
      {
        message: "Error: must be specified in query c",
      },
      {
        message: "Error: must be specified in query d",
      },
    ],
  });
});
