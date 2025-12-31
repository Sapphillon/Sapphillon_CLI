/**
 * Init command - creates a new plugin package development environment
 */

import { joinPath } from "../utils/path.ts";

export interface InitOptions {
  name: string;
  packageId?: string;
  description?: string;
  directory?: string;
}

export class InitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InitError";
  }
}

/**
 * Generate package.toml content
 */
function generatePackageToml(options: InitOptions): string {
  const packageId = options.packageId || "com.example";
  const description = options.description || `Plugin package for ${options.name}`;

  return `[package]
name = "${options.name}"
version = "1.0.0"
description = "${description}"
entry = "src/index.js"
package_id = "${packageId}"
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
 * Initialize a new plugin package development environment
 */
export async function init(options: InitOptions): Promise<void> {
  const targetDir = options.directory || options.name;

  // Check if directory already exists
  try {
    const stat = await Deno.stat(targetDir);
    if (stat.isDirectory) {
      throw new InitError(`Directory '${targetDir}' already exists`);
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    // Directory doesn't exist, which is what we want
  }

  // Create directory structure
  console.log(`📁 Creating plugin package: ${options.name}`);

  try {
    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.mkdir(joinPath(targetDir, "src"), { recursive: true });

    // Generate and write files
    const packageToml = generatePackageToml(options);
    await Deno.writeTextFile(joinPath(targetDir, "package.toml"), packageToml);
    console.log(`   ✓ Created package.toml`);

    const gitignore = generateGitignore();
    await Deno.writeTextFile(joinPath(targetDir, ".gitignore"), gitignore);
    console.log(`   ✓ Created .gitignore`);

    const indexJs = generateIndexJs();
    await Deno.writeTextFile(joinPath(targetDir, "src", "index.js"), indexJs);
    console.log(`   ✓ Created src/index.js`);

    console.log(`\n✅ Plugin package initialized successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  1. cd ${targetDir}`);
    console.log(`  2. Edit src/index.js to add your plugin functions`);
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
