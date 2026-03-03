#!/bin/bash
set -euo pipefail

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    if [ -f "$HOME/.deno/bin/deno" ]; then
        echo "Deno found in $HOME/.deno/bin/deno"
        export PATH="$HOME/.deno/bin:$PATH"
    else
        echo "Deno not found. Installing Deno..."
        # NOTE: This downloads and executes a remote script. Review the script at
        # https://deno.land/install.sh before running, or install Deno manually
        # via a package manager (e.g. 'brew install deno' on macOS) if you prefer
        # not to pipe remote scripts directly to sh.
        curl -fsSL https://deno.land/install.sh | sh
        export PATH="$HOME/.deno/bin:$PATH"
    fi
else
    echo "Deno is already installed: $(deno --version | head -n1)"
fi

# Ensure Deno is in PATH for the rest of the script
export PATH="$HOME/.deno/bin:$PATH"

# Determine the directory of this script to build an absolute path to main.ts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing Sapphillon CLI..."
deno install --global -f -n sapphillon --allow-read --allow-write --allow-net --allow-run --allow-env "$SCRIPT_DIR/main.ts"

echo "Verifying installation..."
if command -v sapphillon &> /dev/null; then
    echo "Sapphillon CLI installed successfully!"
    sapphillon --version
    echo
    echo "To use 'sapphillon' in new terminal sessions, ensure your PATH includes $HOME/.deno/bin."
    echo "For example, add the following line to your shell profile (e.g. ~/.bashrc or ~/.zshrc):"
    echo '    export PATH="$HOME/.deno/bin:$PATH"'
else
    echo "Error: Sapphillon CLI installation failed or not in PATH."
    echo "Please ensure that $HOME/.deno/bin is on your PATH and try running setup.sh again."
    exit 1
fi
