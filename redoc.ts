import { body, operation, response, responseHelper } from "./mod.ts";
import { OperationInternal } from "./operation.ts";

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
<head></head>
<body>
  <redoc spec-url="${openApiPath}"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`,
      );
    },
  });
