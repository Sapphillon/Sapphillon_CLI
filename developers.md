# Sapphillon CLI - Developer Guide

This document explains how to develop the Sapphillon CLI.

## Prerequisites

- [Deno](https://deno.land/) v1.x or higher
- Make (optional, recommended)
- Git

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sapphillon/Sapphillon_CLI.git
cd Sapphillon_CLI
```

### 2. Install Deno

If Deno is not already installed, you can install it with the following commands:

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex

# Or use the Makefile
make install
```

### 3. Using Dev Container (Optional)

If you have VS Code and Docker environment, you can easily set up the development environment using Dev Container:

1. Install the "Dev Containers" extension in VS Code
2. Open the repository
3. Select "Dev Containers: Reopen in Container" from the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)

Dev Container includes:
- Latest version of Deno
- VS Code Deno extension
- Automatic configuration

## Development Workflow

### Make Commands

The project includes a Makefile with commonly used commands:

```bash
# Show available commands
make help

# Run the CLI
make run

# Development mode (watch for file changes and auto-restart)
make dev

# Run tests
make test

# Format code
make fmt

# Check code formatting (no changes)
make fmt-check

# Run linter
make lint

# Clean temporary files
make clean
```

### Deno Tasks

You can also run tasks defined in `deno.json` directly:

```bash
# Run the CLI
deno task start

# Development mode
deno task dev

# Run tests
deno task test

# Format code
deno task fmt

# Run linter
deno task lint
```

## Project Structure

```
Sapphillon_CLI/
├── .devcontainer/          # Dev Container configuration
│   └── devcontainer.json
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       └── ci.yml
├── src/
│   ├── commands/           # CLI command implementations
│   │   ├── greet.ts
│   │   └── greet_test.ts
│   ├── utils/              # Shared utilities
│   │   └── args.ts
│   └── version.ts          # Version information
├── main.ts                 # CLI entry point
├── main_test.ts            # Main tests
├── deno.json               # Deno configuration file
├── Makefile                # Make task definitions
├── .gitignore              # Git ignore file
└── README.md               # Project overview
```

## Adding New Commands

1. Create a new command file in the `src/commands/` directory:

```typescript
// src/commands/mycommand.ts
export function myCommand(options: string): void {
  console.log(`Executing my command with: ${options}`);
}
```

**Note:** Commands can be synchronous (as shown) or asynchronous. For async commands, use `async function` and return `Promise<void>`, and make sure to use `await` when calling them from an async `main` function.

2. Create a test file:

```typescript
// src/commands/mycommand_test.ts
import { myCommand } from "./mycommand.ts";

Deno.test("myCommand executes without error", () => {
  myCommand("test");
  // If we get here without error, the test passes
});
```

3. Register the command in `main.ts`:

```typescript
import { myCommand } from "./src/commands/mycommand.ts";

// Add within the switch statement
case "mycommand":
  myCommand(args.option as string || "default");
  break;
```

## Testing

### Running Tests

```bash
# Run all tests
make test

# Or
deno task test

# Run a specific test file
deno test src/commands/greet_test.ts
```

### Writing Tests

- Use the `*_test.ts` pattern for file names
- Import assertion functions from `jsr:@std/assert`
- Use `Deno.test()` to define tests

## Code Quality

### Formatting

```bash
# Auto-format code
make fmt

# Check formatting (no changes)
make fmt-check
```

Formatting settings are configured in `deno.json`:
- 2-space indentation
- Semicolons used
- Double quotes
- Line width of 100 characters

### Lint

```bash
# Run linter
make lint
```

Deno's built-in linter checks for common issues and anti-patterns.

## CI/CD

GitHub Actions automatically runs the following:

- **Tests**: Run all tests
- **Format Check**: Verify code style
- **Lint**: Check code quality
- **Build Verification**: Ensure the CLI runs correctly

Runs automatically on pull requests or pushes to the main/develop branch.

## Running the CLI

### During Development

```bash
# Show help
deno run --allow-read --allow-write --allow-net main.ts --help

# Show version
deno run --allow-read --allow-write --allow-net main.ts --version

# Run greet command
deno run --allow-read --allow-write --allow-net main.ts greet --name Alice
```

### Using Make

```bash
# Pass arguments
make run ARGS="greet --name Alice"
make run ARGS="--version"
```

## Permissions

Deno is secure by default. We use the following permissions:

- `--allow-read`: File system read access
- `--allow-write`: File system write access
- `--allow-net`: Network access

You can adjust permissions for finer control as needed.

## Troubleshooting

### Deno Command Not Found

Verify that Deno is installed and added to your PATH:

```bash
# Check Deno version
deno --version

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.deno/bin:$PATH"
```

### Tests Failing

1. Ensure all dependencies are up to date
2. Refresh the cache with `deno cache main.ts`
3. If you get permission errors, add the necessary flags

### Formatting Issues

```bash
# Auto-fix
make fmt

# Or check manually
deno fmt --check
```

## Resources

- [Deno Official Documentation](https://deno.land/manual)
- [Deno Standard Library](https://deno.land/std)
- [JSR (JavaScript Registry)](https://jsr.io/)

## Contributing

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `make test`
4. Format and lint: `make fmt && make lint`
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feature/my-feature`
7. Create a pull request

All pull requests must pass CI checks.
