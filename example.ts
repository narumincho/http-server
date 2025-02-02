import {
  createOperationObject,
  createPathItemObjectWithPath,
  httpServe,
  requestBodyJson,
} from "./mod.ts";

const string = () => {};

httpServe({
  paths: [
    createPathItemObjectWithPath({
      path: "/user/:id",
      get: createOperationObject({
        requestBody: [requestBodyJson({
          name: string(),
        })],
        response: {},
        handler: ({ body }) => {},
      }),
    }),
  ],
});
