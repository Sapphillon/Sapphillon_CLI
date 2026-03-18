import { build, BuildError } from "./build.ts";

async function createTestPlugin(dir: string): Promise<void> {
  await Deno.mkdir(`${dir}/src`, { recursive: true });

  await Deno.writeTextFile(
    `${dir}/package.toml`,
    `[package]
name = "test-plugin"
version = "1.0.0"
description = "Test plugin"
entry = "src/index.js"
package_id = "com.test"
`,
  );

  await Deno.writeTextFile(
    `${dir}/src/index.js`,
    `/**
 * Test function.
 * @param {string} msg - The message
 * @returns {string} The result
 */
export function test(msg) {
  return msg;
}
`,
  );
}

async function cleanupTestPlugin(dir: string): Promise<void> {
  try {
    await Deno.remove(dir, { recursive: true });
  } catch {
    // Ignore errors
  }
}

Deno.test("build - creates package.js from source files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-" });

  try {
    await createTestPlugin(testDir);

    // Redirect console.log to capture output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      await build({ projectDir: testDir });
    } finally {
      console.log = originalLog;
    }

    // Verify package.js was created
    const packageJs = await Deno.readTextFile(`${testDir}/package.js`);

    if (!packageJs.includes("Sapphillon.Package")) {
      throw new Error("package.js should contain Sapphillon.Package");
    }

    if (!packageJs.includes('name: "test-plugin"')) {
      throw new Error("package.js should contain package name");
    }

    if (!packageJs.includes("function test(msg)")) {
      throw new Error("package.js should contain the test function");
    }

    if (!packageJs.includes("handler: test")) {
      throw new Error("package.js should reference the function handler");
    }
  } finally {
    await cleanupTestPlugin(testDir);
  }
});

Deno.test("build - includes function metadata", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-meta-" });

  try {
    await createTestPlugin(testDir);

    // Capture output
    const originalLog = console.log;
    console.log = () => {};

    try {
      await build({ projectDir: testDir });
    } finally {
      console.log = originalLog;
    }

    const packageJs = await Deno.readTextFile(`${testDir}/package.js`);

    // Check function metadata
    if (!packageJs.includes('description: "Test function."')) {
      throw new Error("package.js should contain function description");
    }

    if (!packageJs.includes('name: "msg"')) {
      throw new Error("package.js should contain parameter name");
    }

    if (!packageJs.includes('type: "string"')) {
      throw new Error("package.js should contain parameter type");
    }
  } finally {
    await cleanupTestPlugin(testDir);
  }
});

Deno.test("build - respects custom output directory", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-output-" });
  const outputDir = await Deno.makeTempDir({ prefix: "build-test-output-result-" });

  try {
    await createTestPlugin(testDir);

    // Capture output
    const originalLog = console.log;
    console.log = () => {};

    try {
      await build({ projectDir: testDir, outputDir });
    } finally {
      console.log = originalLog;
    }

    // Verify package.js was created in output directory
    const packageJs = await Deno.readTextFile(`${outputDir}/package.js`);
    if (!packageJs.includes("Sapphillon.Package")) {
      throw new Error("package.js should be created in output directory");
    }
  } finally {
    await cleanupTestPlugin(testDir);
    await cleanupTestPlugin(outputDir);
  }
});

Deno.test("build - throws BuildError on missing package.toml", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-missing-" });

  try {
    await build({ projectDir: testDir });
    throw new Error("Expected BuildError to be thrown");
  } catch (error) {
    if (!(error instanceof BuildError)) {
      throw error;
    }
    if (!error.message.includes("package.toml not found")) {
      throw new Error(`Expected 'package.toml not found' in error message, got: ${error.message}`);
    }
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("build - escapes special characters in strings", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-escape-" });

  try {
    await Deno.mkdir(`${testDir}/src`, { recursive: true });

    await Deno.writeTextFile(
      `${testDir}/package.toml`,
      `[package]
name = "test-plugin"
version = "1.0.0"
description = "Test with \\"quotes\\" and backslash \\\\"
entry = "src/index.js"
package_id = "com.test"
`,
    );

    await Deno.writeTextFile(
      `${testDir}/src/index.js`,
      `/**
 * Function with "quotes" in description.
 * @param {string} msg - Param with "quotes"
 * @returns {string} Returns with "quotes"
 */
export function test(msg) {
  return msg;
}
`,
    );

    const originalLog = console.log;
    console.log = () => {};

    try {
      await build({ projectDir: testDir });
    } finally {
      console.log = originalLog;
    }

    const packageJs = await Deno.readTextFile(`${testDir}/package.js`);

    // Verify the output is valid (no unescaped quotes that would break the JS)
    if (!packageJs.includes('description: "Function with \\"quotes\\" in description."')) {
      throw new Error("Quotes should be escaped in function description");
    }
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("build - bundles JavaScript files with imports", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-bundle-" });

  try {
    await Deno.mkdir(`${testDir}/src`, { recursive: true });

    await Deno.writeTextFile(
      `${testDir}/package.toml`,
      `[package]
name = "bundled-plugin"
version = "1.0.0"
description = "Plugin with imports"
entry = "src/index.js"
package_id = "com.bundle"
`,
    );

    // Create a utility file
    await Deno.writeTextFile(
      `${testDir}/src/utils.js`,
      `/**
 * Helper function
 * @param {number} x - Input
 * @returns {number} Result
 */
export function helper(x) {
  return x * 2;
}
`,
    );

    // Create entry file that imports the utility
    await Deno.writeTextFile(
      `${testDir}/src/index.js`,
      `import { helper } from './utils.js';

/**
 * Main function
 * @param {number} n - Number
 * @returns {number} Result
 */
export function main(n) {
  return helper(n);
}
`,
    );

    const originalLog = console.log;
    const originalWarn = console.warn;
    console.log = () => {};
    console.warn = () => {};

    try {
      await build({ projectDir: testDir });
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
    }

    const packageJs = await Deno.readTextFile(`${testDir}/package.js`);

    // Verify bundled code contains both functions
    if (!packageJs.includes("function helper(x)")) {
      throw new Error("package.js should contain the bundled helper function");
    }
    if (!packageJs.includes("function main(n)")) {
      throw new Error("package.js should contain the main function");
    }
    // Check for actual import statements (not just the word "import" in descriptions)
    if (/^\s*import\s+/m.test(packageJs)) {
      throw new Error("package.js should not contain import statements");
    }
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("build - handles TypeScript files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "build-test-ts-" });

  try {
    await Deno.mkdir(`${testDir}/src`, { recursive: true });

    await Deno.writeTextFile(
      `${testDir}/package.toml`,
      `[package]
name = "ts-plugin"
version = "1.0.0"
description = "TypeScript plugin"
entry = "src/index.ts"
package_id = "com.ts"
`,
    );

    await Deno.writeTextFile(
      `${testDir}/src/index.ts`,
      `/**
 * TypeScript function
 * @param {string} name - Name
 * @returns {string} Greeting
 */
export function greet(name: string): string {
  return \`Hello, \${name}\`;
}
`,
    );

    const originalLog = console.log;
    const originalWarn = console.warn;
    console.log = () => {};
    console.warn = () => {};

    try {
      await build({ projectDir: testDir });
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
    }

    const packageJs = await Deno.readTextFile(`${testDir}/package.js`);

    // Verify TypeScript types are stripped
    if (!packageJs.includes("function greet(name)")) {
      throw new Error("TypeScript types should be stripped from function parameters");
    }
    if (packageJs.includes(": string")) {
      throw new Error("TypeScript type annotations should be removed");
    }
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});
