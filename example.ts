import { createHandler, createOperation } from "./mod.ts";

Deno.serve(
  createHandler({
    paths: [
      createOperation({
        path: "/items",
        method: "GET",
        queryParameters: {
          filter: {
            description: "フィルターのパラメーター",
            required: false,
            deprecated: false,
            example: "32",
            schema: "int",
          },
          withDetail: {
            description: "詳細情報も取得するかどうか",
            required: false,
            schema: "boolean",
          },
          sampleRequired: {
            description: "必須パラメーター テスト",
            required: true,
            schema: "string",
          },
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/items",
        method: "POST",
        queryParameters: {},
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/items/:id",
        method: "GET",
        queryParameters: {
          withDetail: {
            description: "詳細情報も取得するかどうか",
            required: false,
            schema: "boolean",
          },
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/items/:id",
        method: "PATCH",
        queryParameters: {},
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/items/:id",
        method: "DELETE",
        queryParameters: {},
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
    ],
  }),
);
