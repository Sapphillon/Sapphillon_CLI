.PHONY: help install run dev test lint fmt fmt-check clean build build-examples

# Default target
help:
	@echo "Sapphillon CLI - Available Make Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install       - Install Deno (if not already installed)"
	@echo "  make run           - Run the CLI (use ARGS=\"...\" for arguments)"
	@echo "  make dev           - Run the CLI in watch mode"
	@echo ""
	@echo "Plugin Development:"
	@echo "  make build         - Build a plugin (use PROJECT=\"./path/to/plugin\")"
	@echo "  make build-examples - Build all example plugins"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test          - Run all tests"
	@echo "  make lint          - Run linter"
	@echo "  make fmt           - Format code"
	@echo "  make fmt-check     - Check code formatting"
	@echo ""
	@echo "Utility:"
	@echo "  make clean         - Clean temporary files and built packages"
	@echo ""
	@echo "Examples:"
	@echo "  make run ARGS=\"--help\""
	@echo "  make run ARGS=\"init my-plugin\""
	@echo "  make build PROJECT=\"./examples/javascript-plugin\""
	@echo ""

# Install Deno if not present
install:
	@if ! command -v deno &> /dev/null; then \
		echo "Installing Deno..."; \
		curl -fsSL https://deno.land/install.sh | sh; \
	else \
		echo "Deno is already installed: $$(deno --version | head -n1)"; \
	fi

# Run the CLI
run:
	deno run --allow-read --allow-write --allow-net --allow-run --allow-env main.ts $(ARGS)

# Run in development mode with watch
dev:
	deno task dev

# Build a plugin package
build:
ifdef PROJECT
	deno run --allow-read --allow-write --allow-net --allow-run --allow-env main.ts build --project $(PROJECT)
else
	@echo "Usage: make build PROJECT=\"./path/to/plugin\""
	@echo "Example: make build PROJECT=\"./examples/javascript-plugin\""
endif

# Build all example plugins
build-examples:
	@echo "Building JavaScript plugin..."
	@deno run --allow-read --allow-write --allow-net --allow-run --allow-env main.ts build --project ./examples/javascript-plugin
	@echo ""
	@echo "Building TypeScript plugin..."
	@deno run --allow-read --allow-write --allow-net --allow-run --allow-env main.ts build --project ./examples/typescript-plugin
	@echo ""
	@echo "Building Weather Forecast plugin..."
	@deno run --allow-read --allow-write --allow-net --allow-run --allow-env main.ts build --project ./examples/weather-forecast-plugin
	@echo ""
	@echo "Building Date Formatter plugin (with npm dependencies)..."
	@deno run --allow-read --allow-write --allow-net --allow-run --allow-env main.ts build --project ./examples/date-formatter-plugin
	@echo ""
	@echo "All examples built successfully!"

# Run tests
test:
	deno task test

# Run linter
lint:
	deno task lint

# Format code
fmt:
	deno task fmt

# Check code formatting
fmt-check:
	deno task fmt:check

# Clean temporary files and built packages
clean:
	@echo "Cleaning temporary files..."
	@rm -rf coverage/ .coverage/ dist/ build/ *.log
	@echo "Clean complete."
