/**
 * Init command - creates a new plugin package development environment
 */

import { joinPath } from "../utils/path.ts";

export interface InitOptions {
  name: string;
  packageId?: string;
  description?: string;
  directory?: string;
  language?: "javascript" | "typescript";
}

export class InitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InitError";
  }
}

/**
 * Escape a string for use in TOML string literal
 */
function escapeTomlString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Generate package.toml content
 */
function generatePackageToml(
  options: InitOptions,
  language: "javascript" | "typescript",
): string {
  const packageId = options.packageId || "com.example";
  const description = options.description || `Plugin package for ${options.name}`;
  const entry = language === "typescript" ? "src/index.ts" : "src/index.js";

  return `[package]
name = "${escapeTomlString(options.name)}"
version = "1.0.0"
description = "${escapeTomlString(description)}"
entry = "${escapeTomlString(entry)}"
package_id = "${escapeTomlString(packageId)}"
`;
}

/**
 * Generate .gitignore content
 */
function generateGitignore(): string {
  return `# Build outputs
package.js
*.js.map

# Dependencies
node_modules/
deno.lock

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
*.tmp
.tmp/
tmp/
`;
}

/**
 * Generate src/index.js content with example function
 */
function generateIndexJs(): string {
  return `/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
 */
export function add(a, b) {
  return a + b;
}
`;
}

/**
 * Generate src/index.ts content with example function
 */
function generateIndexTs(): string {
  return `/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
 */
export function add(a: number, b: number): number {
  return a + b;
}
`;
}

/**
 * Validate a directory path to prevent directory traversal
 */
function validatePath(path: string): string {
  // Normalize the path
  const normalized = path.replace(/\\/g, "/");

  // Check for directory traversal patterns
  // This checks for literal '../' sequences which is sufficient for our use case
  // since we're creating new directories, not resolving existing paths
  if (normalized.includes("../") || normalized.startsWith("..")) {
    throw new InitError(
      `Invalid path: '${path}' contains directory traversal sequences`,
    );
  }

  return normalized;
}

/**
 * Initialize a new plugin package development environment
 */
export async function init(options: InitOptions): Promise<void> {
  const targetDir = validatePath(options.directory || options.name);
  const language = options.language || "javascript";

  // Check if path already exists
  try {
    const stat = await Deno.stat(targetDir);
    if (stat.isDirectory) {
      throw new InitError(`Directory '${targetDir}' already exists`);
    } else {
      throw new InitError(
        `Path '${targetDir}' already exists and is not a directory`,
      );
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    // Path doesn't exist, which is what we want
  }

  // Create directory structure
  console.log(`📁 Creating plugin package: ${options.name}`);
  console.log(`   Language: ${language === "typescript" ? "TypeScript" : "JavaScript"}`);

  try {
    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.mkdir(joinPath(targetDir, "src"), { recursive: true });

    // Generate and write files
    const packageToml = generatePackageToml(options, language);
    await Deno.writeTextFile(joinPath(targetDir, "package.toml"), packageToml);
    console.log(`   ✓ Created package.toml`);

    const gitignore = generateGitignore();
    await Deno.writeTextFile(joinPath(targetDir, ".gitignore"), gitignore);
    console.log(`   ✓ Created .gitignore`);

    const entryFile = language === "typescript" ? "index.ts" : "index.js";
    const entryContent = language === "typescript" ? generateIndexTs() : generateIndexJs();
    await Deno.writeTextFile(joinPath(targetDir, "src", entryFile), entryContent);
    console.log(`   ✓ Created src/${entryFile}`);

    console.log(`\n✅ Plugin package initialized successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  1. cd ${targetDir}`);
    console.log(`  2. Edit src/${entryFile} to add your plugin functions`);
    console.log(`  3. Run 'sapphillon build' to build your package`);
  } catch (error) {
    // Clean up on error
    try {
      await Deno.remove(targetDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
    throw new InitError(
      `Failed to initialize plugin package: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
