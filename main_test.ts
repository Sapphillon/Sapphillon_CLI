import { parseArgs } from "./src/utils/args.ts";
import { VERSION } from "./src/version.ts";
import { main } from "./main.ts";

Deno.test("main function exists and is callable", () => {
  // Test that main is defined and is a function
  if (typeof main !== "function") {
    throw new Error("main is not a function");
  }
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

Deno.test("VERSION constant is defined", () => {
  if (typeof VERSION !== "string") {
    throw new Error("VERSION should be a string");
  }
  if (VERSION.length === 0) {
    throw new Error("VERSION should not be empty");
  }
});
