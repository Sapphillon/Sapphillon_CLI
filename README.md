# Sapphillon_CLI

A command-line tool for creating and building Sapphillon plugin packages.

Sapphillon CLI helps developers scaffold new plugin projects and build them into the Sapphillon package format. It provides scaffolding for both JavaScript and TypeScript plugins, handles bundling, and generates the required metadata for Sapphillon plugins.

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
deno install --allow-read --allow-write --allow-net --allow-run --allow-env -n sapphillon https://raw.githubusercontent.com/Sapphillon/Sapphillon_CLI/main/main.ts

# Or if you've cloned the repository locally
deno install --allow-read --allow-write --allow-net --allow-run --allow-env -n sapphillon main.ts
```

After installation, you can run the CLI from anywhere:

```bash
sapphillon --help
sapphillon init my-plugin
```

### Usage

```bash
# Show help
deno run --allow-read --allow-write --allow-net main.ts --help

# Show version
deno run --allow-read --allow-write --allow-net main.ts --version

# Initialize a new plugin
deno run --allow-read --allow-write --allow-net main.ts init my-plugin

# Initialize a TypeScript plugin
deno run --allow-read --allow-write --allow-net main.ts init --name my-plugin --language typescript

# Build a plugin
deno run --allow-read --allow-write --allow-net main.ts build

# Or use Make
make run ARGS="init my-plugin"
make run ARGS="build --project ./my-plugin"
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

This project uses GitHub Actions for continuous integration and releases.

### Continuous Integration

On every push and pull request, the following checks are run:

- Tests
- Linting
- Code formatting
- Build verification

### Release Workflow

This project includes an automated release workflow that can be triggered manually from the GitHub Actions tab:

1. Go to the [Actions tab](https://github.com/Sapphillon/Sapphillon_CLI/actions/workflows/release.yml) in the repository
2. Click "Run workflow"
3. Select the version bump type:
   - **patch**: Bug fixes and minor changes (0.1.0 → 0.1.1)
   - **minor**: New features, backward compatible (0.1.0 → 0.2.0)
   - **major**: Breaking changes (0.1.0 → 1.0.0)
4. Choose whether this is a pre-release
5. Click "Run workflow"

The workflow will automatically:
- Bump the version in `deno.json` and `src/version.ts`
- Run tests, linting, and formatting checks
- Commit the version bump
- Create a Git tag
- Create a GitHub release with installation instructions

## Contributing

Contributions are welcome! Please see [developers.md](./developers.md) for development guidelines.

## License

See [LICENSE](./LICENSE) for details.
