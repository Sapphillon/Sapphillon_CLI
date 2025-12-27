.PHONY: help install run dev test lint fmt fmt-check clean

# Default target
help:
	@echo "Sapphillon CLI - Available Make Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install    - Install Deno (if not already installed)"
	@echo "  make run        - Run the CLI"
	@echo "  make dev        - Run the CLI in watch mode"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run linter"
	@echo "  make fmt        - Format code"
	@echo "  make fmt-check  - Check code formatting"
	@echo ""
	@echo "Utility:"
	@echo "  make clean      - Clean temporary files"
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
	deno run --allow-read --allow-write --allow-net main.ts $(ARGS)

# Run in development mode with watch
dev:
	deno task dev

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

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	@rm -rf coverage/ .coverage/ dist/ build/ *.log
	@echo "Clean complete."
