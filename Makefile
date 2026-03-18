.PHONY: help build-cli run-cli dev test lint fmt fmt-check clean build-plugin build-examples

# Default target
help:
	@echo "Sapphillon CLI (Rust) - Available Make Commands"
	@echo ""
	@echo "Development:"
	@echo "  make build-cli     - Build the CLI binary"
	@echo "  make run-cli       - Run the CLI (use ARGS=\"...\" for arguments)"
	@echo "  make dev           - Run the CLI in watch mode"
	@echo ""
	@echo "Plugin Development:"
	@echo "  make build-plugin  - Build a plugin (use PROJECT=\"./path/to/plugin\")"
	@echo "  make build-examples - Build all example plugins"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test          - Run all tests"
	@echo "  make lint          - Run linter (clippy)"
	@echo "  make fmt           - Format code"
	@echo "  make fmt-check     - Check code formatting"
	@echo ""
	@echo "Utility:"
	@echo "  make clean         - Clean temporary files and build artifacts"
	@echo ""
	@echo "Examples:"
	@echo "  make run-cli ARGS=\"--help\""
	@echo "  make run-cli ARGS=\"init my-plugin\""
	@echo "  make build-plugin PROJECT=\"./examples/javascript-plugin\""
	@echo ""

# Build the CLI
build-cli:
	cargo build --release

# Run the CLI
run-cli:
	cargo run -- $(ARGS)

# Run in development mode (requires cargo-watch)
dev:
	cargo watch -x check

# Build a plugin package using the CLI
build-plugin:
ifdef PROJECT
	cargo run -- build --project $(PROJECT)
else
	@echo "Usage: make build-plugin PROJECT=\"./path/to/plugin\""
	@echo "Example: make build-plugin PROJECT=\"./examples/javascript-plugin\""
endif

# Build all example plugins
build-examples:
	@echo "Building JavaScript plugin..."
	@cargo run -- build --project ./examples/javascript-plugin
	@echo ""
	@echo "Building TypeScript plugin..."
	@cargo run -- build --project ./examples/typescript-plugin
	@echo ""
	@echo "Building Weather Forecast plugin..."
	@cargo run -- build --project ./examples/weather-forecast-plugin
	@echo ""
	@echo "Building Date Formatter plugin (with npm dependencies)..."
	@cargo run -- build --project ./examples/date-formatter-plugin
	@echo ""
	@echo "Building Text Utils plugin (multi-file JS with npm dependencies)..."
	@cargo run -- build --project ./examples/text-utils-plugin
	@echo ""
	@echo "All examples built successfully!"

# Run tests
test:
	cargo test

# Run linter
lint:
	cargo clippy

# Format code
fmt:
	cargo fmt

# Check code formatting
fmt-check:
	cargo fmt -- --check

# Clean temporary files and build artifacts
clean:
	@echo "Cleaning temporary files..."
	@rm -rf coverage/ .coverage/ dist/ build/ *.log
	@cargo clean
	@echo "Clean complete."
