/**
 * Simple TOML parser for package.toml files
 */

export interface PackageToml {
  package: {
    name: string;
    version: string;
    description: string;
    entry: string;
    author_id: string;
    package_id: string; // Auto-generated: author_id.name
  };
}

/**
 * Convert a name string to a valid package ID component
 * Converts to lowercase and replaces spaces/special chars with hyphens
 */
function toPackageIdComponent(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Parse a TOML string into an object
 * Supports basic TOML syntax: sections, string values, basic key-value pairs
 */
export function parseToml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection: Record<string, unknown> | null = null;
  let currentSectionName = "";

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    // Check for section header [section]
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSectionName = sectionMatch[1];
      currentSection = {};
      result[currentSectionName] = currentSection;
      continue;
    }

    // Parse key = value pairs
    const keyValueMatch = trimmed.match(/^([^=]+)=(.*)$/);
    if (keyValueMatch) {
      const key = keyValueMatch[1].trim();
      let value = keyValueMatch[2].trim();

      // Remove quotes from string values
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      const target = currentSection || result;
      target[key] = value;
    }
  }

  return result;
}

/**
 * Parse a package.toml content and return typed PackageToml
 * package_id is auto-generated from author_id.name
 */
export function parsePackageToml(content: string): PackageToml {
  const parsed = parseToml(content);

  const pkg = parsed.package as Record<string, string> | undefined;
  if (!pkg) {
    throw new Error("Missing [package] section in package.toml");
  }

  const name = pkg.name || "";
  const authorId = pkg.author_id || "";

  // Auto-generate package_id from author_id.name
  const packageId = authorId
    ? `${authorId}.${toPackageIdComponent(name)}`
    : toPackageIdComponent(name);

  return {
    package: {
      name,
      version: pkg.version || "",
      description: pkg.description || "",
      entry: pkg.entry || "src/index.js",
      author_id: authorId,
      package_id: packageId,
    },
  };
}
