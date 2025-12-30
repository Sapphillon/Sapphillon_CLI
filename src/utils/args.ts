/**
 * Simple argument parser for CLI
 */
export interface ParsedArgs {
  _: (string | number)[];
  [key: string]: unknown;
}

/**
 * Mapping of short flags to long flags
 */
const FLAG_ALIASES: { [key: string]: string } = {
  h: "help",
  v: "version",
  n: "name",
  p: "project",
  o: "output",
};

/**
 * Flags that are always treated as boolean and don't accept values.
 * If a value is provided after these flags, it will be treated as a positional argument.
 */
const BOOLEAN_FLAGS = ["help", "version"];

/**
 * Check if a flag should be treated as boolean
 */
function isBooleanFlag(key: string): boolean {
  return BOOLEAN_FLAGS.includes(key);
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = { _: [] };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (isBooleanFlag(key)) {
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
      const longKey = FLAG_ALIASES[key] || key;

      if (isBooleanFlag(longKey)) {
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
