import { assertSpyCall, spy } from "jsr:@std/testing/mock";

import { assertEquals } from "jsr:@std/assert";
import {
  body,
  createHandler,
  json,
  operation,
  requestHeader,
  response,
} from "../mod.ts";
import type { Equal, Expect } from "npm:@type-challenges/utils";

Deno.test("requestHeader optional", async () => {
  const func = spy((_headers: unknown): void => {});
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
        requestHeaders: [
          requestHeader.optional(
            requestHeader.authorizationBearer({}),
            {},
          ),
        ],
        responses: [response.ok({
          description: "",
          headers: [],
          content: [body.textPlain({})],
        })],
        // deno-lint-ignore require-await
        handler: async ({ headers, response }) => {
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
          func(headers);
          return response["200"]([], "text/plain", "");
        },
      }),
    ],
  });

  await handler(
    new Request("https://example.com/samplePath", {
      headers: {
        Authorization: "Bearer sampleToken",
      },
    }),
  );

  await handler(
    new Request("https://example.com/samplePath", {
      headers: {},
    }),
  );

  assertSpyCall(func, 0, { args: [{ Authorization: "sampleToken" }] });
  assertSpyCall(func, 1, { args: [{ Authorization: undefined }] });

  const errorResponse = await handler(
    new Request("https://example.com/samplePath", {
      headers: { Authorization: "invalidText" },
    }),
  );
  assertEquals(errorResponse.status, 400);
  assertEquals(await errorResponse.json(), {
    errors: [
      {
        in: "header",
        message: "Error: invalid Authorization Bearer value",
        name: "Authorization",
      },
    ],
  });
});

Deno.test("requestHeader required", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/samplePath",
        requestHeaders: [
          requestHeader.required(requestHeader.authorizationBearer({}), {}),
        ],
        responses: [response.ok({
          description: "",
          headers: [],
          content: [body.applicationJson(json.object({}))],
        })],
        // deno-lint-ignore require-await
        handler: async ({ headers, response }) => {
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
          return response["200"]([], "application/json", headers);
        },
      }),
    ],
  });

  const errorResponse = await handler(
    new Request("https://example.com/samplePath", {
      headers: {},
    }),
  );
  assertEquals(errorResponse.status, 400);
  assertEquals(await errorResponse.json(), {
    errors: [
      {
        in: "header",
        message: "Error: must be specified",
        name: "Authorization",
      },
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
      Authorization: "sampleToken",
    },
  );
});
