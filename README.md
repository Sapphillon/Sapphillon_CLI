# Sapphillon_CLI

A modern command-line tool built with Deno and TypeScript.

## Features

- 🦕 Built with [Deno](https://deno.land/) - Secure by default
- 📝 TypeScript for type safety
- ✅ Automated testing and CI/CD
- 🔧 Dev Container support for easy development
- 📦 Simple Makefile for common tasks

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) v1.x or higher

### Installation

#### Install from Source

```bash
# Clone the repository
git clone https://github.com/Sapphillon/Sapphillon_CLI.git
cd Sapphillon_CLI

# Install Deno (if not already installed)
make install
```

#### Install via Deno

You can install this CLI globally using Deno's install command:

```bash
# Install from the repository
deno install --allow-read --allow-write --allow-net -n sapphillon https://raw.githubusercontent.com/Sapphillon/Sapphillon_CLI/main/main.ts

# Or if you've cloned the repository locally
deno install --allow-read --allow-write --allow-net -n sapphillon main.ts
```

After installation, you can run the CLI from anywhere:

```bash
sapphillon --help
sapphillon greet --name Alice
```

### Usage

```bash
# Show help
deno run --allow-read --allow-write --allow-net main.ts --help

# Show version
deno run --allow-read --allow-write --allow-net main.ts --version

# Run greet command
deno run --allow-read --allow-write --allow-net main.ts greet --name Alice

# Or use Make
make run ARGS="greet --name Alice"
```

## Development

For detailed development instructions, please see [developers.md](./developers.md).

### Quick Commands

```bash
make test       # Run tests
make lint       # Run linter
make fmt        # Format code
make run        # Run the CLI
```

### Dev Container

This project includes a Dev Container configuration for VS Code. To use it:

1. Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
2. Install the "Dev Containers" extension in VS Code
3. Open the project in VS Code
4. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and select "Dev Containers: Reopen in Container"

## Project Structure

```
Sapphillon_CLI/
├── .devcontainer/          # Dev Container configuration
├── .github/workflows/      # GitHub Actions CI/CD
├── src/
│   ├── commands/           # CLI commands
│   ├── utils/              # Utility functions
│   └── version.ts          # Version information
├── main.ts                 # CLI entry point
├── deno.json               # Deno configuration
├── Makefile                # Build and development tasks
└── developers.md           # Developer documentation
```

## CI/CD

This project uses GitHub Actions for continuous integration. On every push and pull request, the following checks are run:

- Tests
- Linting
- Code formatting
- Build verification

## Contributing

Contributions are welcome! Please see [developers.md](./developers.md) for development guidelines.

## License

See [LICENSE](./LICENSE) for details.
