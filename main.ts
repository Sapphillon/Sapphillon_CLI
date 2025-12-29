#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { parseArgs } from "./src/utils/args.ts";
import { VERSION } from "./src/version.ts";
import { greet } from "./src/commands/greet.ts";

/**
 * Main CLI entry point
 */
function main() {
  const args = parseArgs(Deno.args);

  if (args.version) {
    console.log(`Sapphillon CLI v${VERSION}`);
    Deno.exit(0);
  }

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  const command = args._[0]?.toString();

  switch (command) {
    case "greet": {
      const name = typeof args.name === "string" && args.name.trim().length > 0
        ? args.name
        : "World";
      greet(name);
      break;
    }
    default:
      if (command) {
        console.error(`Unknown command: ${command}`);
        console.error('Run "sapphillon --help" for usage information.');
        Deno.exit(1);
      } else {
        printHelp();
      }
  }
}

function printHelp() {
  console.log(`
Sapphillon CLI v${VERSION}

USAGE:
  sapphillon [COMMAND] [OPTIONS]

COMMANDS:
  greet       Greet someone

OPTIONS:
  -h, --help      Show this help message
  -v, --version   Show version information
  -n, --name      Name to use (for greet command)

EXAMPLES:
  sapphillon greet
  sapphillon greet --name Alice
  sapphillon --version
`);
}

if (import.meta.main) {
  main();
}

export { main };
