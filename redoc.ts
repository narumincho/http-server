import { body, operation, response } from "./mod.ts";
import { OperationInternal } from "./operation.ts";

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
      content: [body.text("text/html")],
    })],
    handler: async () => {
      return {
        statusCode: "200",
        content: {
          mimeType: "text/html",
          content: `<!doctype html>
<html>
<head></head>
<body>
  <redoc spec-url="${openApiPath}"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`,
        },
      } as const;
    },
  });
