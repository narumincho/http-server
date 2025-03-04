import { createHandler, createOperation } from "../mod.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("Unrecognized method respond with the 501 status code", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        // deno-lint-ignore require-await
        handler: async () => new Response(),
      }),
    ],
  });

  assertEquals(
    (await handler(
      new Request("https://example.com", { method: "AAA" }),
    )).status,
    501,
  );

  assertEquals(
    (await handler(
      new Request("https://example.com/samplePath", { method: "AAA" }),
    )).status,
    501,
  );
});

Deno.test("recognized method respond but not allowed for the target resource respond with 405 status code", async () => {
  const handler = createHandler({
    paths: [
      createOperation({
        path: "/samplePath",
        method: "GET",
        queryParameters: {},
        // deno-lint-ignore require-await
        handler: async () => new Response(),
      }),
    ],
  });

  assertEquals(
    (await handler(
      new Request("https://example.com/samplePath", { method: "DELETE" }),
    )).status,
    405,
  );
});
