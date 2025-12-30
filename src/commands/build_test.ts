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
  const testDir = "/tmp/build-test-" + Date.now();

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
  const testDir = "/tmp/build-test-meta-" + Date.now();

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
  const testDir = "/tmp/build-test-output-" + Date.now();
  const outputDir = "/tmp/build-test-output-result-" + Date.now();

  try {
    await createTestPlugin(testDir);
    await Deno.mkdir(outputDir, { recursive: true });

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
  const testDir = "/tmp/build-test-missing-" + Date.now();
  await Deno.mkdir(testDir, { recursive: true });

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
  const testDir = "/tmp/build-test-escape-" + Date.now();

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
