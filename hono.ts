import z from "npm:zod";

// For extending the Zod schema with OpenAPI properties
import "npm:zod-openapi/extend";
import { Hono } from "npm:hono";
import { describeRoute } from "npm:hono-openapi";
import { resolver, validator as zValidator } from "npm:hono-openapi/zod";
import { Scalar } from "npm:@scalar/hono-api-reference";

const querySchema = z
  .object({
    name: z.string().optional().openapi({ example: "Steven" }),
  })
  .openapi({ ref: "Query" });

const responseSchema = z.string().openapi({ example: "Hello Steven!" });

const app = new Hono();

app.get(
  "/",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful greeting response",
        content: {
          "text/plain": {
            schema: resolver(responseSchema),
          },
        },
      },
    },
  }),
  zValidator("query", querySchema),
  (c) => {
    const query = c.req.valid("query");
    return c.text(`Hello ${query?.name ?? "Hono"}!`);
  },
);

app.get(
  "/docs",
  Scalar({
    theme: "saturn",
    url: "/openapi",
  }),
);

Deno.serve(app.fetch);
