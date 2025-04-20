import { body, operation, response, responseHelper } from "./mod.ts";
import { OperationInternal } from "./operation.ts";

/**
 * https://github.com/scalar/scalar
 */
export const createScalarOperation = (
  { path, openApiPath }: {
    readonly path: string;
    readonly openApiPath: string;
  },
): OperationInternal =>
  operation.get({
    path,
    responses: [response.ok({
      description: "Redoc documentation",
      headers: [],
      content: [body.textHtml({})],
    })],
    // deno-lint-ignore require-await
    handler: async () => {
      return responseHelper.ok(
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
  });
