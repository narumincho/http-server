import { createHandler, createOperation } from "./mod.ts";
import {
  queryBoolean,
  queryOptional,
  queryRequired,
  queryString,
} from "./query.ts";

Deno.serve(
  createHandler({
    paths: [
      createOperation({
        path: "/items",
        method: "GET",
        queryParameters: {
          filter: queryOptional({
            description: "フィルターのパラメーター",
            queryItemType: queryString(),
            example: "a",
          }),
          withDetail: queryOptional({
            description: "",
            queryItemType: queryBoolean(),
            example: false,
          }),
          sampleRequired: queryRequired({
            description: "必須パラメーター テスト",
            queryItemType: queryString(),
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
          withDetail: queryOptional({
            description: "詳細情報も取得するかどうか",
            queryItemType: queryBoolean(),
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
