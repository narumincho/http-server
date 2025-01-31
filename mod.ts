export const HttpServe = ({}: { readonly port: number }) => {
  Deno.serve();
};
