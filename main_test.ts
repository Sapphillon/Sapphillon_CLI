import { main } from "./main.ts";

Deno.test("main function exists and is callable", () => {
  // Test that main is defined and is a function
  if (typeof main !== "function") {
    throw new Error("main is not a function");
  }
});
