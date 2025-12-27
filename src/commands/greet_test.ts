import { greet } from "./greet.ts";

Deno.test("greet function executes without error", () => {
  // Test that greet function can be called without throwing
  greet("TestUser");
  // If we get here without error, the test passes
});
