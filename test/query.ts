import { assertEquals } from "jsr:@std/assert";
import { assertSpyCall, spy } from "jsr:@std/testing/mock";
import { createHandler, createOperation } from "../mod.ts";
import { queryString } from "../query.ts";

Deno.test("query parameter", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        queryParameters: {
          key: queryString({
            description: "",
            required: true,
            example: "キー",
          }),
          "サンプルキー!": queryString({
            description: "",
            required: false,
            example: "サンプルキーの例",
          }),
          " &?empty": queryString({
            description: "",
            required: false,
            example: "こんなクエリ名を指定することはまずないけど",
          }),
        },
        // deno-lint-ignore require-await
        handler: async ({ queryParameters }) =>
          new Response(JSON.stringify(queryParameters), {
            headers: {
              "content-type": "application/json",
            },
          }),
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
          a: queryString({
            description: "",
            required: true,
            example: "A",
          }),
          b: queryString({
            description: "",
            required: true,
            example: "B",
          }),
          c: queryString({
            description: "",
            required: true,
            example: "C",
          }),
          d: queryString({
            description: "",
            required: true,
            example: "D",
          }),
          e: queryString({
            description: "",
            required: false,
            example: "E",
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
  assertSpyCall(samplePathHandler, 0);
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errors: [
      {
        message: "c is required in url query parameter",
      },
      {
        message: "d is required in url query parameter",
      },
    ],
  });
});
