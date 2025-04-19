import { assertEquals } from "jsr:@std/assert";
import { spy } from "jsr:@std/testing/mock";
import {
  body,
  createHandler,
  json,
  operation,
  response,
  responseHelper,
} from "../mod.ts";
import { query } from "../mod.ts";
import { Equal, Expect } from "npm:@type-challenges/utils";

Deno.test("query parameter", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
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
        requestHeaders: [],
        responses: [response.ok({
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
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
          return responseHelper.ok("application/json", queryParameters);
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
    operations: [
      operation.get({
        path: "/samplePath",
        responses: [response.ok({
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
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
          return responseHelper.ok("application/json", queryParameters);
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
    Promise<
      {
        statusCode: "200";
        content: { mimeType: "application/json"; content: unknown };
      }
    >
  > // deno-lint-ignore require-await
  (async () => ({
    statusCode: "200",
    content: {
      mimeType: "application/json",
      content: {},
    },
  }));

  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
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
        responses: [response.ok({
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
        handler: samplePathHandler,
      }),
    ],
  });

  const url = new URL("https://example.com/samplePath");
  url.searchParams.set("a", "A");
  url.searchParams.set("b", "B");

  const handlerResponse = await handler(new Request(url));
  // assertSpyCall(samplePathHandler, 0);
  assertEquals(handlerResponse.status, 400);
  assertEquals(await handlerResponse.json(), {
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
