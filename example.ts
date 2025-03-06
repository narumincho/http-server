import { createHandler, createOperation } from "./mod.ts";
import { boolean, optional, required, string } from "./query.ts";

Deno.serve(
  createHandler({
    paths: [
      createOperation({
        path: "/items",
        method: "GET",
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
          withDetail: optional({
            description: "詳細情報も取得するかどうか",
            queryItemType: boolean(),
            example: false,
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
