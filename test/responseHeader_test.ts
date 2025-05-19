import { assertEquals } from "jsr:@std/assert";
import type { Equal, Expect } from "npm:@type-challenges/utils";
import {
  body,
  createHandler,
  json,
  operation,
  response,
  responseHeader,
  responseHelper,
} from "../mod.ts";

// Test case 1: Required and Optional Headers (string, number, boolean)
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
                { description: "Unique request identifier" },
              ),
              // Optional number header
              responseHeader.optional(
                responseHeader.number({ name: "X-RateLimit-Remaining" }),
                { description: "Remaining requests count" },
              ),
              // Optional boolean header
              responseHeader.optional(
                responseHeader.boolean({ name: "X-Cache-Hit" }),
                {
                  description:
                    "Indicates if the response was served from cache",
                },
              ),
            ],
            content: [body.textPlain({})],
          }),
        ],
        handler: async ({ queryParameters }) => {
          const requestId = queryParameters?.reqId ?? "default-id";
          const includeRateLimit = queryParameters?.rateLimit === "true";
          const includeCacheHit = queryParameters?.cacheHit === "true";

          // Prepare headers based on query parameters
          const headers: [string, string | number | boolean][] = [
            ["X-Request-ID", requestId], // Always include the required header
          ];
          if (includeRateLimit) {
            headers.push(["X-RateLimit-Remaining", 100]); // Add optional number header
          }
          if (includeCacheHit) {
            headers.push(["X-Cache-Hit", true]); // Add optional boolean header
          }

          // Type check for the responseHelper.ok headers argument
          type HelperHeaderType = Parameters<typeof responseHelper.ok>[0];
          type ExpectedHelperHeaderType = ReadonlyArray<
            readonly [string, string | number | boolean]
          >;
          type cases = [
            Expect<Equal<HelperHeaderType, ExpectedHelperHeaderType>>,
          ];

          return responseHelper.ok(headers, "text/plain", "Headers Test");
        },
      }),
    ],
  });

  // Case 1: All headers included
  const response1 = await handler(
    new Request(
      "https://example.com/test-basic-headers?reqId=req-1&rateLimit=true&cacheHit=true",
    ),
  );
  assertEquals(response1.status, 200);
  assertEquals(response1.headers.get("X-Request-ID"), "req-1");
  assertEquals(response1.headers.get("X-RateLimit-Remaining"), "100"); // Number stringified
  assertEquals(response1.headers.get("X-Cache-Hit"), "true"); // Boolean stringified
  assertEquals(await response1.text(), "Headers Test");

  // Case 2: Only required header included
  const response2 = await handler(
    new Request("https://example.com/test-basic-headers"),
  );
  assertEquals(response2.status, 200);
  assertEquals(response2.headers.get("X-Request-ID"), "default-id");
  assertEquals(response2.headers.get("X-RateLimit-Remaining"), null); // Optional header absent
  assertEquals(response2.headers.get("X-Cache-Hit"), null); // Optional header absent
  assertEquals(await response2.text(), "Headers Test");

  // Case 3: Required and one optional header included
  const response3 = await handler(
    new Request(
      "https://example.com/test-basic-headers?reqId=req-3&rateLimit=true",
    ),
  );
  assertEquals(response3.status, 200);
  assertEquals(response3.headers.get("X-Request-ID"), "req-3");
  assertEquals(response3.headers.get("X-RateLimit-Remaining"), "100");
  assertEquals(response3.headers.get("X-Cache-Hit"), null);
  assertEquals(await response3.text(), "Headers Test");
});

// Test case 2: Enum Header
Deno.test("responseHeader: enum type", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/status-header",
        responses: [
          response.ok({
            description: "Response with an enum header",
            headers: [
              responseHeader.required(
                // Assuming enum() takes name and possible values
                responseHeader.enum({
                  name: "X-Task-Status",
                  values: [
                    "PENDING",
                    "PROCESSING",
                    "COMPLETED",
                    "FAILED",
                  ] as const,
                }),
                { description: "Current status of the background task" },
              ),
            ],
            content: [
              body.applicationJson(json.object({ taskId: json.string() })),
            ],
          }),
        ],
        handler: async ({ queryParameters }) => {
          const statusParam = queryParameters?.status?.toUpperCase();
          // Determine the status, default to PENDING
          const status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" =
            (statusParam === "PROCESSING" || statusParam === "COMPLETED" ||
                statusParam === "FAILED")
              ? statusParam
              : "PENDING";

          const headers: [string, typeof status][] = [
            ["X-Task-Status", status],
          ];

          // Type check for the responseHelper.ok return type's headers
          const responseObj = responseHelper.ok(headers, "application/json", {
            taskId: "task-123",
          });
          type ResponseHeadersType = typeof responseObj.headers;
          type ExpectedHeadersType =
            | ReadonlyArray<readonly [string, string | number | boolean]>
            | undefined;
          type cases = [
            Expect<Equal<ResponseHeadersType, ExpectedHeadersType>>,
          ];

          return responseObj;
        },
      }),
    ],
  });

  // Case 1: Status = COMPLETED
  const responseCompleted = await handler(
    new Request("https://example.com/status-header?status=completed"),
  );
  assertEquals(responseCompleted.status, 200);
  assertEquals(responseCompleted.headers.get("X-Task-Status"), "COMPLETED");
  assertEquals(await responseCompleted.json(), { taskId: "task-123" });

  // Case 2: Status = PENDING (default)
  const responsePending = await handler(
    new Request("https://example.com/status-header"),
  );
  assertEquals(responsePending.status, 200);
  assertEquals(responsePending.headers.get("X-Task-Status"), "PENDING");
  assertEquals(await responsePending.json(), { taskId: "task-123" });
});

// Test case 3: Handler returns headers not defined in the spec
Deno.test("responseHeader: handler returns undefined headers", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/extra-headers",
        responses: [
          response.ok({
            description: "Response spec has no defined headers",
            headers: [], // No headers defined in this response spec
            content: [body.textPlain({})],
          }),
        ],
        handler: async () => {
          // Handler decides to return some headers anyway
          const headers: [string, string][] = [
            ["X-Custom-Info", "Some value from handler"],
            ["X-Debug-ID", "debug-xyz"],
          ];
          // These should be passed through to the actual Response object
          return responseHelper.ok(
            headers,
            "text/plain",
            "Handler added headers",
          );
        },
      }),
    ],
  });

  const response = await handler(
    new Request("https://example.com/extra-headers"),
  );
  assertEquals(response.status, 200);
  // Verify that the headers returned by the handler are present
  assertEquals(
    response.headers.get("X-Custom-Info"),
    "Some value from handler",
  );
  assertEquals(response.headers.get("X-Debug-ID"), "debug-xyz");
  assertEquals(await response.text(), "Handler added headers");
});

// Test case 4: Handler fails to return a required header
// Assuming the library does NOT validate handler's returned headers against the spec.
Deno.test("responseHeader: handler omits required header", async () => {
  const handler = createHandler({
    operations: [
      operation.get({
        path: "/missing-required-header",
        responses: [
          response.ok({
            description: "Spec requires X-Correlation-ID",
            headers: [
              responseHeader.required(
                responseHeader.string({ name: "X-Correlation-ID" }),
                { description: "Must be present in the response" },
              ),
              responseHeader.optional(
                responseHeader.string({ name: "X-Optional-Data" }),
                {},
              ),
            ],
            content: [body.textPlain({})],
          }),
        ],
        handler: async () => {
          // Handler forgets to include the required X-Correlation-ID
          const headers: [string, string][] = [
            ["X-Optional-Data", "optional value included"],
            ["X-Another-Header", "also included"], // Undefined in spec
          ];
          // Library is expected to proceed without error, as validation is typically handler's responsibility
          return responseHelper.ok(
            headers,
            "text/plain",
            "Required header missing from handler",
          );
        },
      }),
    ],
  });

  const response = await handler(
    new Request("https://example.com/missing-required-header"),
  );
  // Expect 200 OK because the handler completed successfully.
  assertEquals(response.status, 200);
  // The required header specified in the spec is missing in the actual response.
  assertEquals(response.headers.get("X-Correlation-ID"), null);
  // Optional and undefined headers returned by the handler are present.
  assertEquals(
    response.headers.get("X-Optional-Data"),
    "optional value included",
  );
  assertEquals(response.headers.get("X-Another-Header"), "also included");
  assertEquals(await response.text(), "Required header missing from handler");
  // Note: If the library were configured to strictly validate handler output,
  // this might result in a 500 Internal Server Error.
});

// Test case 5: Multiple response definitions with different headers
Deno.test("responseHeader: different headers for different status codes", async () => {
  const handler = createHandler({
    operations: [
      operation.post({ // Using POST for variety
        path: "/create-resource",
        requestBody: { // Added request body for context
          description: "Data to create resource",
          content: [body.applicationJson(json.object({ name: json.string() }))],
        },
        responses: [
          response.created({ // 201 Created response
            description: "Resource created successfully",
            headers: [
              responseHeader.required(
                responseHeader.string({ name: "Location" }),
                { description: "URL of the newly created resource" },
              ),
              responseHeader.optional(responseHeader.string({ name: "ETag" }), {
                description: "Entity tag for the resource",
              }),
            ],
            content: [
              body.applicationJson(
                json.object({ id: json.string(), name: json.string() }),
              ),
            ],
          }),
          response.badRequest({ // 400 Bad Request response
            description: "Invalid input data",
            headers: [
              responseHeader.required(
                responseHeader.string({ name: "X-Error-Detail" }),
                { description: "Details about the validation error" },
              ),
            ],
            content: [
              body.applicationJson(json.object({ error: json.string() })),
            ],
          }),
          response.unauthorized({ // 401 Unauthorized response
            description: "Authentication required",
            headers: [ // Example: WWW-Authenticate is often standard, but defining it here for test
              responseHeader.required(
                responseHeader.string({ name: "WWW-Authenticate" }),
                { description: "Authentication challenge" },
              ),
            ],
            content: [], // No body for 401 in this example
          }),
        ],
        handler: async ({ body: requestBody }) => {
          const name = requestBody.content.name;

          if (!name) {
            // Return 400 Bad Request with X-Error-Detail header
            return responseHelper.badRequest(
              [["X-Error-Detail", "Resource name is required"]],
              "application/json",
              { error: "Validation Failed" },
            );
          }

          if (name === "unauthorized_test") {
            // Simulate an unauthorized case
            return responseHelper.unauthorized(
              [["WWW-Authenticate", 'Bearer realm="example"']],
              // No body/mimeType needed if content is empty
            );
          }

          // Simulate successful creation
          const newId = `res-${Math.random().toString(36).substring(7)}`;
          const location = `/resources/${newId}`;
          const etag = `"${Date.now()}"`;

          // Return 201 Created with Location and ETag headers
          return responseHelper.created(
            [
              ["Location", location],
              ["ETag", etag],
            ],
            "application/json",
            { id: newId, name: name },
          );
        },
      }),
    ],
  });

  // Test success case (201 Created)
  const responseCreated = await handler(
    new Request("https://example.com/create-resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "MyResource" }),
    }),
  );
  assertEquals(responseCreated.status, 201);
  assertEquals(
    responseCreated.headers.get("Location"),
    `/resources/${(await responseCreated.json()).id}`,
  ); // Check Location format
  assertEquals(responseCreated.headers.has("ETag"), true); // Check ETag presence
  assertEquals(responseCreated.headers.get("X-Error-Detail"), null);
  assertEquals(responseCreated.headers.get("WWW-Authenticate"), null);

  // Test bad request case (400 Bad Request)
  const responseBadRequest = await handler(
    new Request("https://example.com/create-resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }), // Empty name triggers validation error
    }),
  );
  assertEquals(responseBadRequest.status, 400);
  assertEquals(responseBadRequest.headers.get("Location"), null);
  assertEquals(responseBadRequest.headers.get("ETag"), null);
  assertEquals(
    responseBadRequest.headers.get("X-Error-Detail"),
    "Resource name is required",
  );
  assertEquals(responseBadRequest.headers.get("WWW-Authenticate"), null);
  assertEquals(await responseBadRequest.json(), { error: "Validation Failed" });

  // Test unauthorized case (401 Unauthorized)
  const responseUnauthorized = await handler(
    new Request("https://example.com/create-resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "unauthorized_test" }), // Special name triggers 401
    }),
  );
  assertEquals(responseUnauthorized.status, 401);
  assertEquals(responseUnauthorized.headers.get("Location"), null);
  assertEquals(responseUnauthorized.headers.get("ETag"), null);
  assertEquals(responseUnauthorized.headers.get("X-Error-Detail"), null);
  assertEquals(
    responseUnauthorized.headers.get("WWW-Authenticate"),
    'Bearer realm="example"',
  );
  assertEquals(await responseUnauthorized.text(), ""); // No body expected
});
