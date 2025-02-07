import { assertEquals } from "jsr:@std/assert";
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
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        queryParameters: {
          a: {
            description: "",
            required: true,
          },
          b: {
            description: "",
            required: true,
          },
          c: {
            description: "",
            required: true,
          },
          d: {
            description: "",
            required: true,
          },
          e: {
            description: "",
            required: false,
          },
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
  url.searchParams.set("a", "A");
  url.searchParams.set("b", "B");

  const response = await handler(new Request(url));
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
