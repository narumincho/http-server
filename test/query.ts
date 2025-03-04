import { assertEquals } from "jsr:@std/assert";
import { spy } from "jsr:@std/testing/mock";
import { createHandler, createOperation } from "../mod.ts";
import { queryOptional, queryRequired, queryString } from "../query.ts";
import { Equal, Expect } from "npm:@type-challenges/utils";

Deno.test("query parameter", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        queryParameters: {
          key: queryRequired({
            description: "",
            queryItemType: queryString(),
            example: "キー",
          }),
          "サンプルキー!": queryOptional({
            description: "",
            queryItemType: queryString(),
            example: "サンプルキーの例",
          }),
          " &?empty": queryOptional({
            description: "",
            queryItemType: queryString(),
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
                  key: string;
                  "\u30B5\u30F3\u30D7\u30EB\u30AD\u30FC!": string | undefined;
                  " &?empty": string | undefined;
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
          a: queryRequired({
            description: "",
            example: "A",
            queryItemType: queryString(),
          }),
          b: queryRequired({
            description: "",
            queryItemType: queryString(),
            example: "B",
          }),
          c: queryRequired({
            description: "",
            example: "C",
            queryItemType: queryString(),
          }),
          d: queryRequired({
            description: "",
            example: "D",
            queryItemType: queryString(),
          }),
          e: queryOptional({
            description: "",
            example: "E",
            queryItemType: queryString(),
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
