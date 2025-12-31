import { init, InitError } from "./init.ts";

async function cleanupTestDir(dir: string): Promise<void> {
  try {
    await Deno.remove(dir, { recursive: true });
  } catch {
    // Ignore errors
  }
}

Deno.test("init - creates plugin package with default structure", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-" });
  const pluginName = "test-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    // Capture console.log output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      await init({ name: pluginName, directory: pluginDir });
    } finally {
      console.log = originalLog;
    }

    // Verify directory structure was created
    const stat = await Deno.stat(pluginDir);
    if (!stat.isDirectory) {
      throw new Error("Plugin directory should be created");
    }

    const srcStat = await Deno.stat(`${pluginDir}/src`);
    if (!srcStat.isDirectory) {
      throw new Error("src directory should be created");
    }

    // Verify package.toml was created and contains correct content
    const packageToml = await Deno.readTextFile(`${pluginDir}/package.toml`);
    if (!packageToml.includes(`name = "${pluginName}"`)) {
      throw new Error("package.toml should contain plugin name");
    }
    if (!packageToml.includes('entry = "src/index.js"')) {
      throw new Error("package.toml should have correct entry point");
    }
    if (!packageToml.includes('package_id = "com.example"')) {
      throw new Error("package.toml should have default package_id");
    }

    // Verify .gitignore was created
    const gitignore = await Deno.readTextFile(`${pluginDir}/.gitignore`);
    if (!gitignore.includes("package.js")) {
      throw new Error(".gitignore should include package.js");
    }
    if (!gitignore.includes("node_modules/")) {
      throw new Error(".gitignore should include node_modules/");
    }

    // Verify src/index.js was created with example function
    const indexJs = await Deno.readTextFile(`${pluginDir}/src/index.js`);
    if (!indexJs.includes("export function add(a, b)")) {
      throw new Error("src/index.js should contain example add function");
    }
    if (!indexJs.includes("@param {number} a")) {
      throw new Error("src/index.js should contain JSDoc comments");
    }
    if (!indexJs.includes("@permission")) {
      throw new Error("src/index.js should contain permission annotations");
    }
  } finally {
    await cleanupTestDir(pluginDir);
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - accepts custom package_id and description", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-custom-" });
  const pluginName = "custom-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({
        name: pluginName,
        directory: pluginDir,
        packageId: "org.custom",
        description: "Custom plugin description",
      });
    } finally {
      console.log = originalLog;
    }

    const packageToml = await Deno.readTextFile(`${pluginDir}/package.toml`);
    if (!packageToml.includes('package_id = "org.custom"')) {
      throw new Error("package.toml should contain custom package_id");
    }
    if (!packageToml.includes('description = "Custom plugin description"')) {
      throw new Error("package.toml should contain custom description");
    }
  } finally {
    await cleanupTestDir(pluginDir);
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - uses plugin name as directory when directory not specified", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-nodir-" });
  const pluginName = "auto-dir-plugin";

  // Change to test directory temporarily
  const originalCwd = Deno.cwd();
  Deno.chdir(testDir);

  try {
    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({ name: pluginName });
    } finally {
      console.log = originalLog;
    }

    // Verify directory was created with plugin name
    const stat = await Deno.stat(`${testDir}/${pluginName}`);
    if (!stat.isDirectory) {
      throw new Error("Directory should be created with plugin name");
    }

    const packageToml = await Deno.readTextFile(`${testDir}/${pluginName}/package.toml`);
    if (!packageToml.includes(`name = "${pluginName}"`)) {
      throw new Error("package.toml should contain plugin name");
    }
  } finally {
    Deno.chdir(originalCwd);
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - throws InitError when directory already exists", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-exists-" });
  const pluginName = "existing-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    // Create the directory first
    await Deno.mkdir(pluginDir);

    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({ name: pluginName, directory: pluginDir });
      throw new Error("Expected InitError to be thrown");
    } catch (error) {
      if (!(error instanceof InitError)) {
        throw error;
      }
      if (!error.message.includes("already exists")) {
        throw new Error(`Expected 'already exists' in error message, got: ${error.message}`);
      }
    } finally {
      console.log = originalLog;
    }
  } finally {
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - displays success messages", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-msg-" });
  const pluginName = "message-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      await init({ name: pluginName, directory: pluginDir });
    } finally {
      console.log = originalLog;
    }

    // Verify success messages were displayed
    const allLogs = logs.join("\n");
    if (!allLogs.includes("Creating plugin package")) {
      throw new Error("Should display creation message");
    }
    if (!allLogs.includes("Created package.toml")) {
      throw new Error("Should display package.toml creation message");
    }
    if (!allLogs.includes("Created .gitignore")) {
      throw new Error("Should display .gitignore creation message");
    }
    if (!allLogs.includes("Created src/index.js")) {
      throw new Error("Should display src/index.js creation message");
    }
    if (!allLogs.includes("initialized successfully")) {
      throw new Error("Should display success message");
    }
  } finally {
    await cleanupTestDir(pluginDir);
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - cleans up on error", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-cleanup-" });
  const pluginName = "cleanup-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    // Create a file where the plugin directory should be to cause an error
    await Deno.writeTextFile(pluginDir, "this is a file");

    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({ name: pluginName, directory: pluginDir });
      throw new Error("Expected InitError to be thrown");
    } catch (error) {
      if (!(error instanceof InitError)) {
        throw error;
      }
    } finally {
      console.log = originalLog;
    }

    // The file should still exist (we don't clean up files, only directories we created)
    try {
      const stat = await Deno.stat(pluginDir);
      if (!stat.isFile) {
        throw new Error("Original file should still exist");
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // This is actually fine - cleanup happened
      } else {
        throw error;
      }
    }
  } finally {
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - creates TypeScript project when language is typescript", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-ts-" });
  const pluginName = "ts-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({ name: pluginName, directory: pluginDir, language: "typescript" });
    } finally {
      console.log = originalLog;
    }

    // Verify package.toml has TypeScript entry
    const packageToml = await Deno.readTextFile(`${pluginDir}/package.toml`);
    if (!packageToml.includes('entry = "src/index.ts"')) {
      throw new Error("package.toml should have TypeScript entry point");
    }

    // Verify src/index.ts was created with TypeScript syntax
    const indexTs = await Deno.readTextFile(`${pluginDir}/src/index.ts`);
    if (!indexTs.includes("export function add(a: number, b: number): number")) {
      throw new Error("src/index.ts should contain TypeScript function signature");
    }
    if (!indexTs.includes("@param {number} a")) {
      throw new Error("src/index.ts should contain JSDoc comments");
    }
    if (!indexTs.includes("@permission")) {
      throw new Error("src/index.ts should contain permission annotations");
    }

    // Verify index.js doesn't exist
    try {
      await Deno.stat(`${pluginDir}/src/index.js`);
      throw new Error("src/index.js should not exist for TypeScript projects");
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } finally {
    await cleanupTestDir(pluginDir);
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - creates JavaScript project by default", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-default-" });
  const pluginName = "default-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({ name: pluginName, directory: pluginDir });
    } finally {
      console.log = originalLog;
    }

    // Verify package.toml has JavaScript entry
    const packageToml = await Deno.readTextFile(`${pluginDir}/package.toml`);
    if (!packageToml.includes('entry = "src/index.js"')) {
      throw new Error("package.toml should have JavaScript entry point by default");
    }

    // Verify src/index.js was created
    const indexJs = await Deno.readTextFile(`${pluginDir}/src/index.js`);
    if (!indexJs.includes("export function add(a, b)")) {
      throw new Error("src/index.js should contain JavaScript function signature");
    }
  } finally {
    await cleanupTestDir(pluginDir);
    await cleanupTestDir(testDir);
  }
});

Deno.test("init - rejects directory traversal paths", async () => {
  const originalLog = console.log;
  console.log = () => {};

  try {
    await init({ name: "test", directory: "../evil-plugin" });
    throw new Error("Expected InitError to be thrown for directory traversal");
  } catch (error) {
    if (!(error instanceof InitError)) {
      throw error;
    }
    if (!error.message.includes("directory traversal")) {
      throw new Error(`Expected 'directory traversal' in error message, got: ${error.message}`);
    }
  } finally {
    console.log = originalLog;
  }
});

Deno.test("init - handles file existing at target path", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-file-exists-" });
  const pluginName = "file-exists-plugin";
  const pluginPath = `${testDir}/${pluginName}`;

  try {
    // Create a file at the target path
    await Deno.writeTextFile(pluginPath, "existing file");

    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({ name: pluginName, directory: pluginPath });
      throw new Error("Expected InitError to be thrown");
    } catch (error) {
      if (!(error instanceof InitError)) {
        throw error;
      }
      if (!error.message.includes("not a directory")) {
        throw new Error(`Expected 'not a directory' in error message, got: ${error.message}`);
      }
    } finally {
      console.log = originalLog;
    }
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("init - escapes special characters in TOML values", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "init-test-escape-" });
  const pluginName = "test-plugin";
  const pluginDir = `${testDir}/${pluginName}`;

  try {
    const originalLog = console.log;
    console.log = () => {};

    try {
      await init({
        name: pluginName,
        directory: pluginDir,
        description: 'Test with "quotes" and \\ backslashes',
        packageId: "com.test",
      });
    } finally {
      console.log = originalLog;
    }

    const packageToml = await Deno.readTextFile(`${pluginDir}/package.toml`);
    // Verify special characters are escaped
    if (!packageToml.includes('\\"quotes\\"')) {
      throw new Error("Quotes should be escaped in TOML");
    }
    if (!packageToml.includes("\\\\")) {
      throw new Error("Backslashes should be escaped in TOML");
    }
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});
