import { type OperationInternal, supportedHttpMethodSet } from "./operation.ts";

export * as json from "./json.ts";
export * as query from "./query.ts";
export * as body from "./body.ts";
export * as operation from "./operation.ts";
export * as requestHeader from "./requestHeader.ts";
export * as response from "./response.ts";
export * as responseHelper from "./responseHelper.ts";
export * as responseHeader from "./responseHeader.ts";

export const createHandler = (
  { operations }: {
    readonly operations: ReadonlyArray<OperationInternal>;
  },
): (request: Request) => Promise<Response> => {
  return async (request): Promise<Response> => {
    const pathsGroupByPath: ReadonlyMap<
      string,
      ReadonlyArray<OperationInternal>
    > = Map
      .groupBy(operations, (operation) => operation.path);
    for (const [path, operations] of pathsGroupByPath) {
      const urlPattern = new URLPattern({ pathname: path });
      const result = urlPattern.exec(request.url);
      if (result) {
        const mathMethodOperation = operations.find((operation) =>
          operation.method === request.method
        );
        if (mathMethodOperation) {
          return await handleOperation({
            operation: mathMethodOperation,
            request,
            result,
          });
        }
        return new Response(undefined, {
          status: supportedHttpMethodSet.has(request.method) ? 405 : 501,
        });
      }
    }
    return new Response(undefined, {
      status: supportedHttpMethodSet.has(request.method) ? 404 : 501,
    });
  };
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
  { operation, request, result }: {
    operation: OperationInternal;
    request: Request;
    result: URLPatternResult;
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
  const needBody = operation.requestBody !== undefined &&
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
  const matchedRequestBodyDefinition = contentType
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

  const responseValue = await operation.handler({
    pathParameters: result.pathname.groups as Record<string, never>,
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
  });
  const matchedResponseObject = operation.responses.find((responseSchema) =>
    responseSchema.statusCode === responseValue.statusCode
  );
  if (!matchedResponseObject) {
    throw new Error(
      `status code error. schema expected = ${
        operation.responses.map((responseSchema) => responseSchema.statusCode)
      }. but got ${responseValue.statusCode}`,
    );
  }
  const matchedBody = matchedResponseObject.content.find((body) =>
    body.mimeType === responseValue.content.mimeType
  );
  if (!matchedBody) {
    throw new Error("internal error. unknown mimeType");
  }
  return new Response(await matchedBody.encode(responseValue.content.content), {
    headers: {
      "Content-Type": responseValue.content.mimeType,
    },
  });
};
