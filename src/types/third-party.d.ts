/**
 * Minimal declarations for untyped third-party APIs.
 * We do not maintain full typings for these; this file only satisfies
 * "Cannot find module" / missing declaration so the rest of the app stays strict.
 */

declare module "opentype.js" {
  const opentype: {
    parse: (buffer: ArrayBuffer) => unknown;
    [key: string]: unknown;
  };
  export default opentype;
}
