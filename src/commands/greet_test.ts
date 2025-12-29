import { greet } from "./greet.ts";

Deno.test("greet function outputs correct greeting", () => {
  // Capture console.log output
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(args.join(" "));
  };

  try {
    greet("TestUser");

    // Verify the output
    if (logs.length !== 2) {
      throw new Error(`Expected 2 log lines, got ${logs.length}`);
    }
    if (logs[0] !== "Hello, TestUser! 👋") {
      throw new Error(`Expected greeting, got: ${logs[0]}`);
    }
    if (logs[1] !== "Welcome to Sapphillon CLI!") {
      throw new Error(`Expected welcome message, got: ${logs[1]}`);
    }
  } finally {
    // Restore console.log
    console.log = originalLog;
  }
});

Deno.test("greet function executes without error", () => {
  // Test that greet function can be called without throwing
  greet("TestUser");
  // If we get here without error, the test passes
});
