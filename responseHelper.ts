import type { AnyResponseHeaderDefinition } from "./responseHeader.ts";

export const ok = <
  const M extends string = never,
  const H extends Record<string, unknown> = never,
  const C = never,
>(
  mimeType: M,
  headers: H,
  content: C,
): {
  readonly statusCode: "200";
  readonly headers: H;
  readonly content: { readonly mimeType: M; readonly content: C };
} => {
  return {
    statusCode: "200",
    headers,
    content: { mimeType, content },
  };
};
