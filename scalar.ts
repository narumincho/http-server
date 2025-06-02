import {
  body,
  createPathItem,
  operationWithoutBody,
  type PathItem,
  response,
} from "./mod.ts";

/**
 * https://github.com/scalar/scalar
 */
export const createScalarOperation = (
  { openApiPath }: {
    readonly openApiPath: string;
  },
): PathItem =>
  createPathItem({
    get: operationWithoutBody({
      responses: [response.ok({
        description: "Documentation by Scalar",
        headers: [],
        content: [body.textHtml({})],
      })],
      // deno-lint-ignore require-await
      handler: async ({ response }) => {
        return response["200"](
          {},
          "text/html",
          `<!doctype html>
<html>
  <head>
    <title>Scalar API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>

  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>

    <script>
      Scalar.createApiReference('#app', {
        url: '${openApiPath}',
      })
    </script>
  </body>
</html>`,
        );
      },
    }),
  });
