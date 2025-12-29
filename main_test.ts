import { parseArgs } from "./src/utils/args.ts";
import { VERSION } from "./src/version.ts";

Deno.test("main function exists and is callable", () => {
  // Import main dynamically to avoid side effects
  import("./main.ts").then((mod) => {
    if (typeof mod.main !== "function") {
      throw new Error("main is not a function");
    }
  });
});

Deno.test("parseArgs correctly parses version flag", () => {
  const args = parseArgs(["--version"]);
  if (args.version !== true) {
    throw new Error("Expected version flag to be true");
  }
});

Deno.test("parseArgs correctly parses help flag", () => {
  const args = parseArgs(["--help"]);
  if (args.help !== true) {
    throw new Error("Expected help flag to be true");
  }
});

Deno.test("parseArgs correctly parses greet command", () => {
  const args = parseArgs(["greet"]);
  if (args._[0] !== "greet") {
    throw new Error("Expected first positional arg to be 'greet'");
  }
});

Deno.test("parseArgs correctly parses greet command with name", () => {
  const args = parseArgs(["greet", "--name", "Alice"]);
  if (args._[0] !== "greet") {
    throw new Error("Expected first positional arg to be 'greet'");
  }
  if (args.name !== "Alice") {
    throw new Error("Expected name to be 'Alice'");
  }
});

Deno.test("VERSION constant is defined", () => {
  if (typeof VERSION !== "string") {
    throw new Error("VERSION should be a string");
  }
  if (VERSION.length === 0) {
    throw new Error("VERSION should not be empty");
  }
});
