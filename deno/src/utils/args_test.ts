import { parseArgs } from "./args.ts";

Deno.test("parseArgs - parses long flags correctly", () => {
  const result = parseArgs(["--help"]);
  if (result.help !== true) throw new Error("Expected help to be true");
  if (result._.length !== 0) throw new Error("Expected no positional args");
});

Deno.test("parseArgs - parses short flags correctly", () => {
  const result = parseArgs(["-h"]);
  if (result.help !== true) throw new Error("Expected help to be true");
  if (result._.length !== 0) throw new Error("Expected no positional args");
});

Deno.test("parseArgs - parses flags with values", () => {
  const result = parseArgs(["--name", "Alice"]);
  if (result.name !== "Alice") throw new Error("Expected name to be Alice");
  if (result._.length !== 0) throw new Error("Expected no positional args");
});

Deno.test("parseArgs - parses short flags with values", () => {
  const result = parseArgs(["-n", "Bob"]);
  if (result.name !== "Bob") throw new Error("Expected name to be Bob");
  if (result._.length !== 0) throw new Error("Expected no positional args");
});

Deno.test("parseArgs - parses positional arguments", () => {
  const result = parseArgs(["greet", "hello"]);
  if (result._[0] !== "greet") throw new Error("Expected first arg to be greet");
  if (result._[1] !== "hello") throw new Error("Expected second arg to be hello");
});

Deno.test("parseArgs - parses mixed arguments", () => {
  const result = parseArgs(["greet", "--name", "Charlie", "-v"]);
  if (result._[0] !== "greet") throw new Error("Expected first arg to be greet");
  if (result.name !== "Charlie") throw new Error("Expected name to be Charlie");
  if (result.version !== true) throw new Error("Expected version to be true");
});

Deno.test("parseArgs - handles boolean flags without values", () => {
  const result = parseArgs(["--verbose"]);
  if (result.verbose !== true) throw new Error("Expected verbose to be true");
});

Deno.test("parseArgs - handles version flag", () => {
  const result = parseArgs(["--version"]);
  if (result.version !== true) throw new Error("Expected version to be true");
});

Deno.test("parseArgs - handles short version flag", () => {
  const result = parseArgs(["-v"]);
  if (result.version !== true) throw new Error("Expected version to be true");
});

Deno.test("parseArgs - handles multiple flags", () => {
  const result = parseArgs(["--help", "--version"]);
  if (result.help !== true) throw new Error("Expected help to be true");
  if (result.version !== true) throw new Error("Expected version to be true");
});

Deno.test("parseArgs - handles empty arguments", () => {
  const result = parseArgs([]);
  if (result._.length !== 0) throw new Error("Expected no positional args");
});

Deno.test("parseArgs - ignores values after help/version flags", () => {
  const result = parseArgs(["--help", "something"]);
  if (result.help !== true) throw new Error("Expected help to be true");
  // The "something" should be treated as a positional argument
  if (result._[0] !== "something") {
    throw new Error("Expected 'something' as positional argument");
  }
});
