import { assertEquals } from "jsr:@std/assert";
import {
  body,
  createHandler,
  operation,
  response,
  responseHeader,
} from "../mod.ts";

Deno.test("responseHeader: required and optional types", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/test-basic-headers",
        responses: [
          response.ok({
            description: "Response with various header types",
            headers: [
              // Required string header
              responseHeader.required(
                responseHeader.accessControlAllowHeaders(),
                {},
              ),
              // Optional boolean header
              responseHeader.optional(
                responseHeader.accessControlAllowMethods(),
                {},
              ),
            ],
            content: [body.textPlain({})],
          }),
        ],
        handler: async ({ response }) => {
          return await response["200"](
            {
              "Access-Control-Allow-Headers": [],
              "Access-Control-Allow-Methods": ["GET", "POST"],
            },
            "text/plain",
            "Headers Test",
          );
        },
      }),
    ],
  });

  const response1 = await handler(
    new Request(
      "https://example.com/test-basic-headers",
    ),
  );
  assertEquals(response1.status, 200);
  assertEquals(response1.headers.get("Access-Control-Allow-Headers"), "");
  assertEquals(
    response1.headers.get("Access-Control-Allow-Methods"),
    "GET, POST",
  );
  assertEquals(await response1.text(), "Headers Test");
});
