import { body, operation, response } from "./mod.ts";
import type { OperationInternal } from "./operation.ts";

/**
 * https://github.com/Redocly/redoc
 */
export const createRedocOperation = (
  { path, openApiPath }: {
    readonly path: string;
    readonly openApiPath: string;
  },
): OperationInternal =>
  operation.get({
    path,
    responses: [response.ok({
      description: "Documentation by Redoc",
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
<head></head>
<body>
  <redoc spec-url="${openApiPath}"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`,
      );
    },
  });
