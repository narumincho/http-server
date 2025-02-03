import { createHandler, createPathItemObjectWithPath } from "./mod.ts";

const string = () => {};

Deno.serve(
  createHandler({
    paths: [
      createPathItemObjectWithPath({
        path: "/user/:id",
        get: {
          handler: async ({ pathParameters }) => {
            console.log(pathParameters);
            return new Response();
          },
        },
      }),
    ],
  }),
);
