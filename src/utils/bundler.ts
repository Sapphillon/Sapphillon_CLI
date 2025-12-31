/**
 * Bundler utility for JavaScript and TypeScript files
 * Manually resolves and bundles local imports
 */

// Simple path utilities (to avoid network dependencies)
function dirname(path: string): string {
  const lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return ".";
  return path.substring(0, lastSlash) || "/";
}

function normalizePath(path: string): string {
  const isAbsolute = path.startsWith("/");
  const parts = path.split("/");
  const normalized: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      if (normalized.length > 0 && normalized[normalized.length - 1] !== "..") {
        // Go up one directory when possible
        normalized.pop();
      } else if (!isAbsolute) {
        // Preserve leading ".." for relative paths when there is no parent to pop
        normalized.push("..");
      }
    } else if (part !== "." && part !== "") {
      normalized.push(part);
    }
  }

  const result = normalized.join("/");
  if (isAbsolute) {
    return result ? "/" + result : "/";
  }
  return result;
}

function resolvePath(base: string, relative: string): string {
  if (relative.startsWith("/")) {
    return normalizePath(relative);
  }
  return normalizePath(base + "/" + relative);
}

export interface BundleOptions {
  entryPoint: string;
  projectDir: string;
}

export interface BundleResult {
  code: string;
  isTypeScript: boolean;
}

/**
 * Check if the entry file or project uses TypeScript
 */
function isTypeScriptFile(entryPoint: string): boolean {
  return entryPoint.endsWith(".ts") || entryPoint.endsWith(".tsx");
}

/**
 * Resolve import path relative to current file
 */
function resolveImportPath(importPath: string, currentFile: string): string {
  const currentDir = dirname(currentFile);
  return resolvePath(currentDir, importPath);
}

/**
 * Extract import statements and their specifiers from code
 */
function extractImports(
  code: string,
): { imports: Map<string, string[]>; codeWithoutImports: string } {
  const imports = new Map<string, string[]>();

  // Match various import patterns
  const importRegex =
    /^\s*import\s+(?:(\{[^}]+\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(\{[^}]+\}))?\s+from\s+)?['"]([^'"]+)['"];?\s*$/gm;

  const codeWithoutImports = code.replace(importRegex, (match, named, additional, specifier) => {
    // Only process local imports (starting with ./ or ../)
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const importedNames: string[] = [];

      if (named) {
        // Parse named imports like { a, b } or default imports
        if (named.startsWith("{")) {
          const names = named.slice(1, -1).split(",").map((n: string) => n.trim());
          importedNames.push(...names);
        } else if (named.includes(" as ")) {
          // * as something
          importedNames.push(named);
        } else {
          // default import
          importedNames.push(named);
        }
      }

      if (additional) {
        const names = additional.slice(1, -1).split(",").map((n: string) => n.trim());
        importedNames.push(...names);
      }

      imports.set(specifier, importedNames);
      return ""; // Remove import statement
    }
    return match; // Keep non-local imports
  });

  return { imports, codeWithoutImports };
}

/**
 * Remove export keywords from code
 */
function removeExports(code: string): string {
  return code
    .replace(/^export\s+default\s+/gm, "")
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, "")
    .replace(/^export\s+/gm, "");
}

/**
 * Strip TypeScript type annotations from code (simple approach)
 * This handles common patterns but may not cover all TypeScript syntax.
 *
 * Known limitations:
 * - Complex generics with nested brackets (e.g., `Map<string, Array<number>>`)
 * - Union/intersection types with parentheses
 * - Multi-line interface/type declarations with nested objects
 * - Conditional types and mapped types
 *
 * For complex TypeScript codebases, consider using a proper TypeScript compiler.
 */
function stripTypeAnnotations(code: string): string {
  // Remove type annotations from function parameters: (param: Type) -> (param)
  let result = code.replace(
    /(\w+)\s*:\s*[\w\[\]<>,\s|&]+(?=[,)])/g,
    "$1",
  );

  // Remove return type annotations: ): Type { -> ) {
  result = result.replace(
    /\)\s*:\s*[\w\[\]<>,\s|&]+\s*\{/g,
    ") {",
  );

  // Remove type assertions: as Type
  result = result.replace(/\s+as\s+[\w<>\[\]]+/g, "");

  // Remove interface and type declarations (multi-line)
  result = result.replace(/^(?:export\s+)?(?:interface|type)\s+\w+[^{]*\{[^}]*\}\s*$/gm, "");

  return result;
}

/**
 * Recursively bundle a file and its dependencies
 */
async function bundleFile(
  filePath: string,
  bundledFiles: Set<string>,
): Promise<string> {
  // Normalize the path
  const normalizedPath = normalizePath(filePath);

  // Avoid circular dependencies
  if (bundledFiles.has(normalizedPath)) {
    return "";
  }
  bundledFiles.add(normalizedPath);

  // Read the file
  let code: string;
  try {
    code = await Deno.readTextFile(normalizedPath);
  } catch {
    // Try adding .js extension if not present
    if (!normalizedPath.endsWith(".js") && !normalizedPath.endsWith(".ts")) {
      try {
        code = await Deno.readTextFile(normalizedPath + ".js");
      } catch {
        try {
          code = await Deno.readTextFile(normalizedPath + ".ts");
        } catch {
          throw new Error(`Cannot find module: ${filePath}`);
        }
      }
    } else {
      throw new Error(`Cannot read file: ${filePath}`);
    }
  }

  // Extract and process imports
  const { imports, codeWithoutImports } = extractImports(code);

  // Bundle dependencies first
  let bundledDependencies = "";
  for (const [specifier] of imports) {
    const resolvedPath = resolveImportPath(specifier, normalizedPath);
    const depCode = await bundleFile(resolvedPath, bundledFiles);
    bundledDependencies += depCode + "\n";
  }

  // Remove exports and combine
  const processedCode = removeExports(codeWithoutImports);

  return bundledDependencies + processedCode;
}

/**
 * Bundle the entry point and all its dependencies into a single JavaScript string
 */
export async function bundle(options: BundleOptions): Promise<BundleResult> {
  const { entryPoint } = options;
  const isTypeScript = isTypeScriptFile(entryPoint);

  // Manually bundle the entry point and its dependencies
  const bundledFiles = new Set<string>();
  let code = await bundleFile(entryPoint, bundledFiles);

  // Strip TypeScript type annotations if it's a TypeScript file
  if (isTypeScript) {
    code = stripTypeAnnotations(code);
  }

  return {
    code: code.trim(),
    isTypeScript,
  };
}

/**
 * Check if the source code contains local import statements
 */
export function hasImports(content: string): boolean {
  // Match import statements from local files (starting with ./ or ../)
  const localImportRegex =
    /^\s*import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*\{[^}]*\})?\s+from\s+)?['"]\.\.?\/[^'"]+['"];?\s*$/gm;
  return localImportRegex.test(content);
}
