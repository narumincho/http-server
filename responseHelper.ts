export const ok = <const M extends string = never, const C = never>(
  mimeType: M,
  content: C,
): {
  readonly statusCode: "200";
  readonly content: { readonly mimeType: M; readonly content: C };
} => {
  return {
    statusCode: "200",
    content: { mimeType, content },
  };
};
