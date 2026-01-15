/**
 * Build command - transforms plugin source to Sapphillon package format
 */

import { parsePackageToml } from "../utils/parsers/toml.ts";
import { type FunctionInfo, parseJavaScript } from "../utils/parsers/jsdoc.ts";
import { bundle, hasImports } from "../utils/bundler.ts";
import { joinPath } from "../utils/path.ts";

export interface BuildOptions {
  projectDir: string;
  outputDir?: string;
}

export class BuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuildError";
  }
}

/**
 * Escape a string for use in JavaScript string literal
 */
function escapeJsString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Check if entry file is TypeScript
 */
function isTypeScript(entryPath: string): boolean {
  return entryPath.endsWith(".ts") || entryPath.endsWith(".tsx");
}

/**
 * Generate the functions object for Sapphillon.Package
 */
function generateFunctionsObject(functions: FunctionInfo[]): string {
  const entries = functions.map((fn) => {
    const permissions = fn.permissions.map((p) =>
      `{type: "${escapeJsString(p.type)}", resource: "${escapeJsString(p.resource)}"}`
    ).join(", ");

    // Handle empty arrays with cleaner formatting
    const parametersContent = fn.parameters.length > 0
      ? fn.parameters.map((p) =>
        `{ name: "${escapeJsString(p.name)}", idx: ${p.idx}, type: "${escapeJsString(p.type)
        }", description: "${escapeJsString(p.description)}" }`
      ).join(",\n        ")
      : "";

    const returnsContent = fn.returns.length > 0
      ? fn.returns.map((r) =>
        `{ type: "${escapeJsString(r.type)}", idx: ${r.idx}, description: "${escapeJsString(r.description)
        }" }`
      ).join(",\n        ")
      : "";

    // Format arrays based on whether they have content
    const parametersStr = parametersContent ? `[\n        ${parametersContent}\n      ]` : "[]";
    const returnsStr = returnsContent ? `[\n        ${returnsContent}\n      ]` : "[]";

    return `    ${fn.name}: {
      handler: ${fn.name},
      permissions: [${permissions}],
      description: "${escapeJsString(fn.description)}",
      parameters: ${parametersStr},
      returns: ${returnsStr}
    }`;
  });

  return entries.join(",\n");
}

/**
 * Build a plugin package from source files
 * Supports JavaScript and TypeScript with imports - bundles all dependencies into a single file
 */
export async function build(options: BuildOptions): Promise<void> {
  const { projectDir, outputDir = projectDir } = options;

  // Read package.toml
  const packageTomlPath = joinPath(projectDir, "package.toml");
  let packageTomlContent: string;

  try {
    packageTomlContent = await Deno.readTextFile(packageTomlPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new BuildError(`package.toml not found at ${packageTomlPath}`);
    }
    throw error;
  }

  const packageToml = parsePackageToml(packageTomlContent);

  // Read the entry file (e.g., src/index.js or src/index.ts)
  const entryPath = joinPath(projectDir, packageToml.package.entry);
  let entryContent: string;

  try {
    entryContent = await Deno.readTextFile(entryPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new BuildError(`Entry file not found at ${entryPath}`);
    }
    throw error;
  }

  // Parse functions from the original source file (to get JSDoc annotations)
  const functions = parseJavaScript(entryContent);

  if (functions.length === 0) {
    console.warn("Warning: No exported functions found in entry file");
  }

  // Check if we need to bundle (TypeScript or has imports)
  const needsBundling = isTypeScript(entryPath) || hasImports(entryContent);
  let bundledCode = "";

  if (needsBundling) {
    console.log("📦 Bundling dependencies...");
    try {
      const result = await bundle({
        entryPoint: entryPath,
        projectDir: projectDir,
      });
      bundledCode = result.code;

      // Remove export statements from bundled code since we're creating a package
      bundledCode = bundledCode
        .replace(/^export\s+\{[^}]*\};?\s*$/gm, "")
        .replace(/^export\s+/gm, "")
        .trim();

      if (result.isTypeScript) {
        console.log("   - TypeScript transpiled");
      }
    } catch (error) {
      throw new BuildError(
        `Bundling failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else {
    // For simple JS files without imports, just remove exports
    bundledCode = entryContent
      .replace(/^export\s+/gm, "")
      .trim();
  }

  // Generate package.js content with bundled code and Sapphillon.Package metadata
  const packageJsContent = `${bundledCode}

Sapphillon.Package = {
  meta: {
    name: "${escapeJsString(packageToml.package.name)}",
    version: "${escapeJsString(packageToml.package.version)}",
    description: "${escapeJsString(packageToml.package.description)}",
    author_id: "${escapeJsString(packageToml.package.author_id)}",
    package_id: "${escapeJsString(packageToml.package.package_id)}"
  },
  functions: {
${generateFunctionsObject(functions)}
  }
};
`;

  // Write package.js
  const outputPath = joinPath(outputDir, "package.js");
  await Deno.writeTextFile(outputPath, packageJsContent);

  console.log(`✅ Build complete: ${outputPath}`);
  console.log(`   - Found ${functions.length} function(s)`);
  if (needsBundling) {
    console.log(`   - Dependencies bundled into single file`);
  }
}
