import { type HttpMethod, httpMethodFromString } from "./http/method.ts";
import { type SimpleUrl, urlToSimpleUrl } from "./http/url.ts";
import type {
  OperationInternalWithBody,
  OperationInternalWithoutBody,
} from "./operation.ts";
import {
  getAllowMethods,
  getOperationByHttpMethod,
  type PathItem,
} from "./pathItem.ts";
import { stringArrayEqual, stringArrayStartWith } from "./util.ts";

export { createPathItem, type PathItem } from "./pathItem.ts";
export * from "./operation.ts";

export * as json from "./json.ts";
export * as query from "./query.ts";
export * as body from "./body.ts";
export * as requestHeader from "./requestHeader.ts";
export * as response from "./response.ts";
export * as responseHeader from "./responseHeader.ts";

export const createHandler = (
  { pathItem }: {
    readonly pathItem: PathItem;
  },
): (request: Request) => Promise<Response> => {
  return async (request): Promise<Response> => {
    const httpMethod = httpMethodFromString(request.method);
    if (!httpMethod) {
      // https://datatracker.ietf.org/doc/html/rfc9110#section-9.1-10
      return new Response(undefined, { status: 501 });
    }

    return await handleInPathItem({
      prefix: [],
      pathItem,
      request,
      simpleUrl: urlToSimpleUrl(new URL(request.url)),
      method: httpMethod,
      pathVariables: {},
    });
  };
};

const handleInPathItem = async (
  { prefix, pathItem, simpleUrl, request, method, pathVariables }: {
    prefix: ReadonlyArray<string>;
    pathItem: PathItem;
    request: Request;
    simpleUrl: SimpleUrl;
    method: HttpMethod;
    pathVariables: { readonly [key: string]: string };
  },
): Promise<Response> => {
  if (stringArrayEqual(simpleUrl.pathSegments, prefix)) {
    const operation = getOperationByHttpMethod(pathItem, method);
    if (!operation) {
      return new Response(undefined, {
        status: 405,
        headers: {
          Allow: Array.from(getAllowMethods(pathItem)).join(", "),
        },
      });
    }
    return handleOperation({
      operation,
      request,
      pathVariables,
    });
  }
  for (const [subPath, subPathItem] of Object.entries(pathItem.subPath ?? {})) {
    const subPrefix = [...prefix, subPath];
    if (stringArrayStartWith(simpleUrl.pathSegments, subPrefix)) {
      return await handleInPathItem({
        prefix: subPrefix,
        pathItem: subPathItem,
        request,
        method,
        pathVariables,
        simpleUrl,
      });
    }
  }
  if (pathItem.subPathVariable) {
    const { variableName, pathItem: subPathItem } = pathItem.subPathVariable;
    const variableValue = simpleUrl.pathSegments[prefix.length];
    if (variableValue !== undefined) {
      return await handleInPathItem({
        prefix,
        pathItem: subPathItem,
        request,
        method,
        pathVariables: {
          ...pathVariables,
          [variableName]: variableValue,
        },
        simpleUrl,
      });
    }
  }
  return new Response(undefined, { status: 404 });
};

type ValueOrError = {
  readonly type: "value";
  readonly name: string;
  readonly value: unknown;
} | {
  readonly type: "error";
  readonly name: string;
  readonly in: "query" | "header";
  readonly message: string;
};

const handleOperation = async (
  { operation, request, pathVariables }: {
    operation: OperationInternalWithBody | OperationInternalWithoutBody;
    request: Request;
    pathVariables: { readonly [key: string]: string };
  },
): Promise<Response> => {
  const searchParams = new URL(request.url).searchParams;
  const queryParameters = Object.entries(operation.queryParameters ?? {}).map((
    [name, queryParameter],
  ): ValueOrError => {
    try {
      return {
        type: "value",
        name,
        value: queryParameter.decode(searchParams.getAll(name)),
      };
    } catch (e) {
      return {
        type: "error",
        name,
        in: "query",
        message: `${e} in query ${name}`,
      };
    }
  });
  const headers = operation.requestHeaders.map((
    header,
  ): ValueOrError => {
    try {
      return {
        type: "value",
        name: header.name,
        value: header.decode(request.headers.get(header.name) ?? undefined),
      };
    } catch (e) {
      return {
        type: "error",
        name: header.name,
        in: "header",
        message: `${e}`,
      };
    }
  });
  const errors = [...headers, ...queryParameters].filter((e) =>
    e.type === "error"
  );
  if (errors.length > 0) {
    return new Response(
      JSON.stringify({
        errors: errors.map((e) => ({
          name: e.name,
          in: e.in,
          message: e.message,
        })),
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      },
    );
  }

  const contentType = request.headers.get("content-type");
  const needBody = "requestBody" in operation &&
    operation.requestBody !== undefined &&
    operation.requestBody.content.length > 0;
  if (
    needBody && request.body === null
  ) {
    return new Response(
      JSON.stringify({
        errors: [{ message: "body is required" }],
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      },
    );
  }
  const matchedRequestBodyDefinition = contentType &&
      "requestBody" in operation
    ? operation.requestBody?.content.find((e) => e.mimeType === contentType)
    : undefined;

  if (needBody && matchedRequestBodyDefinition === undefined) {
    return new Response(
      JSON.stringify({
        errors: [{ message: "content-type is invalid" }],
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 415,
      },
    );
  }

  return await operation.handler({
    pathParameters: pathVariables,
    queryParameters: Object.fromEntries(
      queryParameters.map((e) => {
        if (e.type === "error") {
          throw new Error("expected error response");
        }
        return [e.name, e.value];
      }),
    ),
    headers: Object.fromEntries(
      headers.map((e) => {
        if (e.type === "error") {
          throw new Error("expected error response");
        }
        return [e.name, e.value];
      }),
    ),
    body: matchedRequestBodyDefinition
      ? {
        mimeType: matchedRequestBodyDefinition.mimeType,
        content: await matchedRequestBodyDefinition.decode(request),
      }
      : undefined,
    response: Object.fromEntries(operation.responses.map((
      response,
    ) => [response.statusCode, async (headers, mimeType, content) => {
      const matchedBody = response.content.find((body) =>
        body.mimeType === mimeType
      );
      if (!matchedBody) {
        throw new Error("internal error. unknown mimeType");
      }
      return new Response(
        await matchedBody.encode(content),
        {
          headers: {
            ...Object.fromEntries(response.headers.map((
              headerDefinition,
            ) => [
              headerDefinition.name,
              headerDefinition.encode(headers[headerDefinition.name] as never),
            ])),
            "Content-Type": mimeType,
          },
        },
      );
    }])),
  });
};
