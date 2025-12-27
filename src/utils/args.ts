/**
 * Simple argument parser for CLI
 */
export interface ParsedArgs {
  _: (string | number)[];
  [key: string]: unknown;
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = { _: [] };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (key === "help" || key === "version") {
        result[key] = true;
      } else if (nextArg && !nextArg.startsWith("-")) {
        result[key] = nextArg;
        i++;
      } else {
        result[key] = true;
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];

      // Map short flags to long flags
      const mapping: { [key: string]: string } = {
        h: "help",
        v: "version",
        n: "name",
      };

      const longKey = mapping[key] || key;

      if (longKey === "help" || longKey === "version") {
        result[longKey] = true;
      } else if (nextArg && !nextArg.startsWith("-")) {
        result[longKey] = nextArg;
        i++;
      } else {
        result[longKey] = true;
      }
    } else {
      result._.push(arg);
    }
  }

  return result;
}
