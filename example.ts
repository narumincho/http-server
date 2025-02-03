import { createHandler, createOperation } from "./mod.ts";

Deno.serve(
  createHandler({
    paths: [
      createOperation({
        path: "/users",
        method: "GET",
        queryParameters: {
          sample: 3,
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/users",
        method: "POST",
        queryParameters: {
          sample: 3,
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/users/:id",
        method: "GET",
        queryParameters: {
          sample: 3,
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/users/:id",
        method: "PATCH",
        queryParameters: {
          sample: 3,
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
      createOperation({
        path: "/users/:id",
        method: "DELETE",
        queryParameters: {
          sample: 3,
        },
        handler: async ({ pathParameters, queryParameters }) => {
          console.log(pathParameters, queryParameters);
          return new Response();
        },
      }),
    ],
  }),
);
