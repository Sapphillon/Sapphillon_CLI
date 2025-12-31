#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { parseArgs } from "./src/utils/args.ts";
import { VERSION } from "./src/version.ts";
import { build, BuildError } from "./src/commands/build.ts";
import { init, InitError } from "./src/commands/init.ts";

/**
 * Main CLI entry point
 */
async function main() {
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
    case "build": {
      const projectDir = typeof args.project === "string" && args.project.trim().length > 0
        ? args.project
        : Deno.cwd();
      const outputDir = typeof args.output === "string" && args.output.trim().length > 0
        ? args.output
        : undefined;
      try {
        await build({ projectDir, outputDir });
      } catch (error) {
        if (error instanceof BuildError) {
          console.error(`Error: ${error.message}`);
          Deno.exit(1);
        }
        throw error;
      }
      break;
    }
    case "init": {
      const name = typeof args.name === "string" && args.name.trim().length > 0
        ? args.name
        : args._[1]?.toString();

      if (!name) {
        console.error("Error: Plugin name is required");
        console.error("Usage: sapphillon init <plugin-name> [OPTIONS]");
        console.error("   or: sapphillon init --name <plugin-name> [OPTIONS]");
        Deno.exit(1);
      }

      const directory = typeof args.directory === "string" && args.directory.trim().length > 0
        ? args.directory
        : undefined;
      const packageId =
        typeof args["package-id"] === "string" && args["package-id"].trim().length > 0
          ? args["package-id"]
          : undefined;
      const description = typeof args.description === "string" && args.description.trim().length > 0
        ? args.description
        : undefined;

      // Parse language option
      let language: "javascript" | "typescript" | undefined = undefined;
      if (typeof args.language === "string" && args.language.trim().length > 0) {
        const lang = args.language.toLowerCase();
        if (lang === "typescript" || lang === "ts") {
          language = "typescript";
        } else if (lang === "javascript" || lang === "js") {
          language = "javascript";
        } else {
          console.error(
            `Error: Invalid language '${args.language}'. Use 'javascript' (js) or 'typescript' (ts)`,
          );
          Deno.exit(1);
        }
      }

      try {
        await init({ name, directory, packageId, description, language });
      } catch (error) {
        if (error instanceof InitError) {
          console.error(`Error: ${error.message}`);
          Deno.exit(1);
        }
        throw error;
      }
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

A command-line tool for creating and building Sapphillon plugin packages.

USAGE:
  sapphillon [COMMAND] [OPTIONS]

COMMANDS:
  init        Initialize a new plugin package
  build       Build a plugin package

OPTIONS:
  -h, --help          Show this help message
  -v, --version       Show version information
  -n, --name          Name to use (for init command)
  -p, --project       Project directory (for build command, default: current directory)
  -o, --output        Output directory (for build command, default: same as project)
  -d, --directory     Target directory (for init command, default: plugin name)
  --package-id        Package ID (for init command, default: com.example)
  --description       Package description (for init command)
  --language          Language for init command: 'javascript' (js) or 'typescript' (ts), default: javascript

EXAMPLES:
  sapphillon init my-plugin
  sapphillon init --name my-plugin --language typescript
  sapphillon init --name my-plugin --package-id com.mycompany --language ts
  sapphillon build
  sapphillon build --project ./my-plugin
  sapphillon --version
`);
}

if (import.meta.main) {
  main();
}

export { main };
