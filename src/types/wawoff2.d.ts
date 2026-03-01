/**
 * Type declarations for wawoff2 package
 * WebAssembly wrapper around Google's official C++ WOFF2 code
 */

declare module "wawoff2" {
  /**
   * Decompress a WOFF2 font file to TTF/OTF format
   * @param input - WOFF2 file data as Uint8Array
   * @returns Promise that resolves to decompressed TTF/OTF data as Uint8Array
   */
  export function decompress(input: Uint8Array): Promise<Uint8Array>;

  /**
   * Compress a TTF/OTF font file to WOFF2 format
   * @param input - TTF/OTF file data as Uint8Array
   * @returns Promise that resolves to compressed WOFF2 data as Uint8Array
   */
  export function compress(input: Uint8Array): Promise<Uint8Array>;

  /**
   * Default export (for CommonJS compatibility)
   */
  const wawoff2: {
    decompress: (input: Uint8Array) => Promise<Uint8Array>;
    compress: (input: Uint8Array) => Promise<Uint8Array>;
  };

  export default wawoff2;
}
