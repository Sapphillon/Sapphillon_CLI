import { joinPath } from "./path.ts";

Deno.test("joinPath - joins simple paths", () => {
  const result = joinPath("a", "b", "c");
  if (result !== "a/b/c") {
    throw new Error(`Expected "a/b/c", got "${result}"`);
  }
});

Deno.test("joinPath - handles trailing slashes", () => {
  const result = joinPath("a/", "b/", "c/");
  if (result !== "a/b/c") {
    throw new Error(`Expected "a/b/c", got "${result}"`);
  }
});

Deno.test("joinPath - handles leading slashes", () => {
  const result = joinPath("a", "/b", "/c");
  if (result !== "a/b/c") {
    throw new Error(`Expected "a/b/c", got "${result}"`);
  }
});

Deno.test("joinPath - handles multiple slashes", () => {
  const result = joinPath("a///", "///b", "c");
  if (result !== "a/b/c") {
    throw new Error(`Expected "a/b/c", got "${result}"`);
  }
});

Deno.test("joinPath - handles absolute paths", () => {
  const result = joinPath("/home", "user", "documents");
  if (result !== "/home/user/documents") {
    throw new Error(`Expected "/home/user/documents", got "${result}"`);
  }
});

Deno.test("joinPath - filters out empty segments", () => {
  const result = joinPath("a", "", "b", "", "c");
  if (result !== "a/b/c") {
    throw new Error(`Expected "a/b/c", got "${result}"`);
  }
});

Deno.test("joinPath - handles single segment", () => {
  const result = joinPath("path");
  if (result !== "path") {
    throw new Error(`Expected "path", got "${result}"`);
  }
});

Deno.test("joinPath - handles root path", () => {
  const result = joinPath("/", "a", "b");
  if (result !== "/a/b") {
    throw new Error(`Expected "/a/b", got "${result}"`);
  }
});
