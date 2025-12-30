/**
 * Build command - transforms plugin source to Sapphillon package format
 */

import { parsePackageToml } from "../utils/parsers/toml.ts";
import { type FunctionInfo, parseJavaScript } from "../utils/parsers/jsdoc.ts";

export interface BuildOptions {
  projectDir: string;
  outputDir?: string;
}

/**
 * Build function declarations (without export keyword) for the package.js
 */
function generateFunctionDeclarations(functions: FunctionInfo[]): string {
  return functions.map((fn) => {
    const params = fn.parameters.map((p) => p.name).join(", ");
    return `function ${fn.name}(${params}) {
  ${fn.body}
}`;
  }).join("\n\n");
}

/**
 * Generate the functions object for Sapphillon.Package
 */
function generateFunctionsObject(functions: FunctionInfo[]): string {
  const entries = functions.map((fn) => {
    const permissions = fn.permissions.map((p) =>
      `{type: "${p.type}", resource: "${p.resource}"}`
    ).join(", ");

    const parameters = fn.parameters.map((p) =>
      `{ name: "${p.name}", idx: ${p.idx}, type: "${p.type}", description: "${p.description}" }`
    ).join(",\n        ");

    const returns = fn.returns.map((r) =>
      `{ type: "${r.type}", idx: ${r.idx}, description: "${r.description}" }`
    ).join(",\n        ");

    return `    ${fn.name}: {
      handler: ${fn.name},
      permissions: [${permissions}],
      description: "${fn.description}",
      parameters: [
        ${parameters}
      ],
      returns: [
        ${returns}
      ]
    }`;
  });

  return entries.join(",\n");
}

/**
 * Build a plugin package from source files
 */
export async function build(options: BuildOptions): Promise<void> {
  const { projectDir, outputDir = projectDir } = options;

  // Read package.toml
  const packageTomlPath = `${projectDir}/package.toml`;
  let packageTomlContent: string;

  try {
    packageTomlContent = await Deno.readTextFile(packageTomlPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Error: package.toml not found at ${packageTomlPath}`);
      Deno.exit(1);
    }
    throw error;
  }

  const packageToml = parsePackageToml(packageTomlContent);

  // Read the entry file (e.g., src/index.js)
  const entryPath = `${projectDir}/${packageToml.package.entry}`;
  let entryContent: string;

  try {
    entryContent = await Deno.readTextFile(entryPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Error: Entry file not found at ${entryPath}`);
      Deno.exit(1);
    }
    throw error;
  }

  // Parse functions from the entry file
  const functions = parseJavaScript(entryContent);

  if (functions.length === 0) {
    console.warn("Warning: No exported functions found in entry file");
  }

  // Generate package.js content
  const packageJsContent = `${generateFunctionDeclarations(functions)}

Sapphillon.Package = {
  meta: {
    name: "${packageToml.package.name}",
    version: "${packageToml.package.version}",
    description: "${packageToml.package.description}",
    package_id: "${packageToml.package.package_id}"
  },
  functions: {
${generateFunctionsObject(functions)}
  }
};
`;

  // Write package.js
  const outputPath = `${outputDir}/package.js`;
  await Deno.writeTextFile(outputPath, packageJsContent);

  console.log(`✅ Build complete: ${outputPath}`);
  console.log(`   - Found ${functions.length} function(s)`);
}
