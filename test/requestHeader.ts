import { assertSpyCall, spy } from "jsr:@std/testing/mock";

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

Deno.test("requestHeader", async () => {
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
          func(headers);
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

  await handler(
    new Request("https://example.com/samplePath", {
      headers: {},
    }),
  );

  assertSpyCall(func, 1, { args: [{ Authorization: undefined }] });
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
        message: "Error: value is undefined",
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
      Authorization: "Bearer sampleToken",
    },
  );
});
