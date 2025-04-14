import { assertEquals } from "jsr:@std/assert";
import {
  body,
  createHandler,
  json,
  operation,
  requestHeader,
  response,
  responseHelper,
} from "../mod.ts";
import { Equal, Expect } from "npm:@type-challenges/utils";

Deno.test("header", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
        requestHeaders: [
          requestHeader.authorizationBearer({ required: false }),
        ],
        responses: [response.ok({
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
        // deno-lint-ignore require-await
        handler: async ({ headers }) => {
          type cases = [
            Expect<
              Equal<
                typeof headers,
                {
                  readonly Authorization: string | undefined;
                }
              >
            >,
          ];
          return responseHelper.ok("application/json", headers);
        },
      }),
    ],
  });

  assertEquals(
    await (await handler(
      new Request("https://example.com/samplePath", {
        headers: {
          Authorization: "Bearer sampleToken",
        },
      }),
    )).json(),
    {
      Authorization: "Bearer sampleToken",
    },
  );

  assertEquals(
    await (await handler(
      new Request("https://example.com/samplePath", {
        headers: {},
      }),
    )).json(),
    {
      // TODO json にしてしまったため undefined が渡せていない
      Authorization: undefined,
    },
  );
});

Deno.test("header required", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
        requestHeaders: [
          requestHeader.authorizationBearer({ required: true }),
        ],
        responses: [response.ok({
          description: "",
          content: [body.applicationJson(json.object({}))],
        })],
        // deno-lint-ignore require-await
        handler: async ({ headers }) => {
          type cases = [
            Expect<
              Equal<
                typeof headers,
                {
                  readonly Authorization: string;
                }
              >
            >,
          ];
          return responseHelper.ok("application/json", headers);
        },
      }),
    ],
  });
  assertEquals(
    (await handler(
      new Request("https://example.com/samplePath", {
        headers: {},
      }),
    )).status,
    500,
  );
});
