/**
 * Path utility functions
 */

/**
 * Join path segments, handling trailing slashes
 */
export function joinPath(...segments: string[]): string {
  return segments
    .map((s, i) => {
      if (i === 0) return s.replace(/\/+$/, "");
      return s.replace(/^\/+|\/+$/g, "");
    })
    .filter((s) => s.length > 0)
    .join("/");
}
