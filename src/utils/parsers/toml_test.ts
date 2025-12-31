import { parsePackageToml, parseToml } from "./toml.ts";

Deno.test("parseToml - parses basic TOML structure", () => {
  const content = `
[package]
name = "test-plugin"
version = "1.0.0"
`;
  const result = parseToml(content);
  const pkg = result.package as Record<string, string>;
  if (pkg.name !== "test-plugin") {
    throw new Error(`Expected name to be 'test-plugin', got '${pkg.name}'`);
  }
  if (pkg.version !== "1.0.0") {
    throw new Error(`Expected version to be '1.0.0', got '${pkg.version}'`);
  }
});

Deno.test("parseToml - handles double-quoted strings", () => {
  const content = `
[package]
name = "my-plugin"
`;
  const result = parseToml(content);
  const pkg = result.package as Record<string, string>;
  if (pkg.name !== "my-plugin") {
    throw new Error(`Expected name to be 'my-plugin', got '${pkg.name}'`);
  }
});

Deno.test("parseToml - handles single-quoted strings", () => {
  const content = `
[package]
name = 'my-plugin'
`;
  const result = parseToml(content);
  const pkg = result.package as Record<string, string>;
  if (pkg.name !== "my-plugin") {
    throw new Error(`Expected name to be 'my-plugin', got '${pkg.name}'`);
  }
});

Deno.test("parseToml - ignores comments", () => {
  const content = `
# This is a comment
[package]
name = "test"
# Another comment
version = "1.0.0"
`;
  const result = parseToml(content);
  const pkg = result.package as Record<string, string>;
  if (pkg.name !== "test") {
    throw new Error(`Expected name to be 'test', got '${pkg.name}'`);
  }
});

Deno.test("parsePackageToml - parses full package.toml", () => {
  const content = `
[package]
name = "my-awesome-plugin"
version = "1.0.0"
description = "A test plugin"
entry = "src/index.js"
package_id = "com.example"
`;
  const result = parsePackageToml(content);
  if (result.package.name !== "my-awesome-plugin") {
    throw new Error(`Expected name to be 'my-awesome-plugin'`);
  }
  if (result.package.version !== "1.0.0") {
    throw new Error(`Expected version to be '1.0.0'`);
  }
  if (result.package.description !== "A test plugin") {
    throw new Error(`Expected description to be 'A test plugin'`);
  }
  if (result.package.entry !== "src/index.js") {
    throw new Error(`Expected entry to be 'src/index.js'`);
  }
  if (result.package.package_id !== "com.example") {
    throw new Error(`Expected package_id to be 'com.example'`);
  }
});

Deno.test("parsePackageToml - throws on missing package section", () => {
  const content = `
name = "test"
`;
  try {
    parsePackageToml(content);
    throw new Error("Expected to throw on missing package section");
  } catch (e) {
    if (!(e instanceof Error) || !e.message.includes("Missing [package]")) {
      throw e;
    }
  }
});
