#!/bin/bash
set -e

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    if [ -f "$HOME/.deno/bin/deno" ]; then
        echo "Deno found in $HOME/.deno/bin/deno"
        export PATH="$HOME/.deno/bin:$PATH"
    else
        echo "Deno not found. Installing Deno..."
        curl -fsSL https://deno.land/install.sh | sh
        export PATH="$HOME/.deno/bin:$PATH"
    fi
else
    echo "Deno is already installed: $(deno --version | head -n1)"
fi

# Ensure Deno is in PATH for the rest of the script
export PATH="$HOME/.deno/bin:$PATH"

echo "Installing Sapphillon CLI..."
deno install --global -f -n sapphillon --allow-read --allow-write --allow-net --allow-run --allow-env main.ts

echo "Verifying installation..."
if command -v sapphillon &> /dev/null; then
    echo "Sapphillon CLI installed successfully!"
    sapphillon --version
else
    echo "Error: Sapphillon CLI installation failed or not in PATH."
    exit 1
fi
