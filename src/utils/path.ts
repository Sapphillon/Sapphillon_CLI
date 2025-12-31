/**
 * Path utility functions
 */

/**
 * Join path segments, normalizing slashes and filtering empty segments
 */
export function joinPath(...segments: string[]): string {
  // Handle empty segments array
  if (segments.length === 0) return "";

  // Preserve leading slash if first segment starts with it
  const isAbsolute = segments[0].startsWith("/");

  const normalized = segments
    .map((s, i) => {
      if (i === 0) {
        // For first segment, remove trailing slashes but keep leading slash
        return s.replace(/\/+$/, "");
      }
      // For other segments, remove both leading and trailing slashes
      return s.replace(/^\/+|\/+$/g, "");
    })
    .filter((s) => s.length > 0)
    .join("/");

  // If original path was absolute and normalization removed the slash, add it back
  if (isAbsolute && !normalized.startsWith("/")) {
    return "/" + normalized;
  }

  return normalized;
}
