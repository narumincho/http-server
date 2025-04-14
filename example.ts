import {
  body,
  createHandler,
  json,
  operation,
  requestHeader,
  response,
  responseHelper,
} from "./mod.ts";
import { boolean, optional, required, string } from "./query.ts";
import { createOpenApi, createOpenApiOperation } from "./openApi.ts";
import { createRedocOperation } from "./redoc.ts";
import { createScalarOperation } from "./scalar.ts";

const operations: Parameters<typeof createHandler>["0"]["operations"] = [
  operation.get({
    path: "/items",
    description: "アイテムを一覧で取得します",
    queryParameters: {
      filter: optional({
        description: "フィルターのパラメーター",
        queryItemType: string(),
        example: "a",
      }),
      withDetail: optional({
        description: "",
        queryItemType: boolean(),
        example: false,
      }),
      sampleRequired: required({
        description: "必須パラメーター テスト",
        queryItemType: string(),
        example: "サンプル必須!",
      }),
    },
    requestHeaders: [
      requestHeader.authorizationBearer({ required: true, deprecated: false }),
    ],
    responses: [
      response.ok({
        description: "取得結果を返します",
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
      withDetail: optional({
        description: "詳細情報も取得するかどうか",
        queryItemType: boolean(),
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
