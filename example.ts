import {
  body,
  createHandler,
  createPathItem,
  json,
  operationWithBody,
  operationWithoutBody,
  query,
  requestHeader,
  response,
} from "./mod.ts";
import { createOpenApi, createOpenApiPathItem } from "./openApi.ts";
import { createRedocOperation } from "./redoc.ts";
import { createScalarOperation } from "./scalar.ts";

const pathItem = createPathItem({
  subPath: {
    "items": createPathItem({
      get: operationWithoutBody({
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
        handler: async ({ queryParameters, response }) => {
          console.log(queryParameters);
          return response["200"]({}, "application/json", [{ name: "" }]);
        },
      }),
      post: operationWithBody({
        queryParameters: {},
        requestBody: { description: "", content: [] },
        responses: [response.ok({
          headers: [],
          description: "結果を返します",
          content: [
            body.applicationJson(json.object({
              wip: json.string(),
            })),
          ],
        })],
        // deno-lint-ignore require-await
        handler: async ({ queryParameters, response }) => {
          console.log(queryParameters);
          return response["200"]({}, "application/json", { wip: "123" });
        },
      }),
      subPathVariable: {
        variableName: "id",
        pathItem: createPathItem({
          get: operationWithoutBody({
            queryParameters: {
              withDetail: query.optional({
                description: "詳細情報も取得するかどうか",
                queryItemType: query.boolean(),
                example: false,
              }),
            },
            responses: [response.ok({
              headers: [],
              description: "結果を返します",
              content: [
                body.applicationJson(json.object({
                  wip: json.string(),
                })),
              ],
            })],
            // deno-lint-ignore require-await
            handler: async ({ queryParameters, response }) => {
              console.log(queryParameters);
              return response["200"]({}, "application/json", { wip: "123" });
            },
          }),
        }),
      },
    }),
    "openApi": createOpenApiPathItem({
      // deno-lint-ignore require-await
      handler: async ({ response }) =>
        response["200"](
          {},
          "application/json",
          createOpenApi({
            info: {
              title: "@narumincho/http-server example",
              version: "0.0.1",
            },
            pathItem,
          }),
        ),
    }),
    "redoc": createRedocOperation({ openApiPath: "/openApi" }),
    "scalar": createScalarOperation({
      openApiPath: "/openapi",
    }),
  },
});

Deno.serve(
  createHandler({ pathItem }),
);
