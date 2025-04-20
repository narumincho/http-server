import {
  body,
  createHandler,
  json,
  operation,
  query,
  requestHeader,
  response,
  responseHelper,
} from "./mod.ts";
import { createOpenApi, createOpenApiOperation } from "./openApi.ts";
import { createRedocOperation } from "./redoc.ts";
import { createScalarOperation } from "./scalar.ts";

const operations: Parameters<typeof createHandler>["0"]["operations"] = [
  operation.get({
    path: "/items",
    description: "アイテムを一覧で取得します",
    queryParameters: {
      filter: query.optional({
        description: "フィルターのパラメーター",
        queryItemType: query.string(),
        example: "a",
      }),
      withDetail: query.optional({
        description: "",
        queryItemType: query.boolean(),
        example: false,
      }),
      sampleRequired: query.required({
        description: "必須パラメーター テスト",
        queryItemType: query.string(),
        example: "サンプル必須!",
      }),
    },
    requestHeaders: [
      requestHeader.required(requestHeader.authorizationBearer({}), {}),
    ],
    responses: [
      response.ok({
        description: "取得結果を返します",
        headers: [],
        content: [
          body.applicationJson(json.array(json.object({
            name: json.string(),
          }))),
          body.applicationOctetStream(),
        ],
      }),
    ],
    // deno-lint-ignore require-await
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return responseHelper.ok("application/json", [{ name: "" }]);
    },
  }),
  operation.post({
    path: "/items",
    queryParameters: {},
    responses: [response.ok({
      description: "結果を返します",
      content: [
        body.applicationJson(json.object({
          wip: json.string(),
        })),
      ],
    })],
    // deno-lint-ignore require-await
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return responseHelper.ok("application/json", { wip: "123" });
    },
  }),
  operation.get({
    path: "/items/:id",
    queryParameters: {
      withDetail: query.optional({
        description: "詳細情報も取得するかどうか",
        queryItemType: query.boolean(),
        example: false,
      }),
    },
    responses: [response.ok({
      description: "結果を返します",
      content: [
        body.applicationJson(json.object({
          wip: json.string(),
        })),
      ],
    })],
    // deno-lint-ignore require-await
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return responseHelper.ok("application/json", { wip: "123" });
    },
  }),
  operation.patch({
    path: "/items/:id",
    responses: [response.ok({
      description: "結果を返します",
      content: [
        body.applicationJson(json.object({
          wip: json.string(),
        })),
      ],
    })],
    // deno-lint-ignore require-await
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return responseHelper.ok("application/json", { wip: "123" });
    },
  }),
  operation.delete({
    path: "/items/:id",
    responses: [response.ok({
      description: "結果を返します",
      content: [
        body.applicationJson(json.object({
          wip: json.string(),
        })),
      ],
    })],
    // deno-lint-ignore require-await
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return responseHelper.ok(
        "application/json",
        { wip: "123" },
      );
    },
  }),
  createOpenApiOperation({
    path: "/openapi",
    // deno-lint-ignore require-await
    handler: async () =>
      createOpenApi({
        info: {
          title: "@narumincho/http-server example",
          version: "0.0.1",
        },
        operations,
      }),
  }),
  createRedocOperation({ path: "/redoc", openApiPath: "/openapi" }),
  createScalarOperation({ path: "/scalar", openApiPath: "/openapi" }),
];

Deno.serve(
  createHandler({
    operations,
  }),
);
