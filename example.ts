import { createHandler, createOperation } from "./mod.ts";
import { queryBoolean, queryString } from "./query.ts";

Deno.serve(
  createHandler({
    paths: [
      createOperation({
        path: "/items",
        method: "GET",
        queryParameters: {
          filter: queryString({
            description: "フィルターのパラメーター",
            required: false,
            deprecated: false,
            example: "a",
          }),
          withDetail: queryBoolean({
            description: "詳細情報も取得するかどうか",
            required: false,
            example: false,
          }),
          sampleRequired: queryString({
            description: "必須パラメーター テスト",
            required: true,
            example: "サンプル必須!",
          }),
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
          withDetail: queryBoolean({
            description: "詳細情報も取得するかどうか",
            required: false,
          }),
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
