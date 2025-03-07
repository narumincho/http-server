import { body, createHandler, json, operation, response } from "./mod.ts";
import { boolean, optional, required, string } from "./query.ts";
import { createOpenApi, createOpenApiOperation } from "./openApi.ts";

const paths: Parameters<typeof createHandler>["0"]["paths"] = [
  operation.get({
    path: "/items",
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
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return {
        statusCode: "200",
        content: { mimeType: "application/json", content: [{ name: "" }] },
      } as const;
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
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return {
        statusCode: "200",
        content: { mimeType: "application/json", content: { wip: "123" } },
      } as const;
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
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return {
        statusCode: "200",
        content: { mimeType: "application/json", content: { wip: "123" } },
      } as const;
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
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return {
        statusCode: "200",
        content: { mimeType: "application/json", content: { wip: "123" } },
      } as const;
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
    handler: async ({ pathParameters, queryParameters }) => {
      console.log(pathParameters, queryParameters);
      return {
        statusCode: "200",
        content: { mimeType: "application/json", content: { wip: "123" } },
      } as const;
    },
  }),
  createOpenApiOperation({
    handler: async () =>
      createOpenApi({
        info: {
          title: "@narumincho/http-server example",
          version: "0.0.1",
        },
        paths,
      }),
  }),
];

Deno.serve(
  createHandler({
    paths,
  }),
);
