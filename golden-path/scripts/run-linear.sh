#!/bin/bash

# Quick runner script for Linear integration examples
# This script sets up environment variables and runs the Linear examples

set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set Linear API credentials
# Get credentials from environment variables or use defaults
export LINEAR_API_KEY="${LINEAR_API_KEY:-${LINEAR_API_KEY}}"
export LINEAR_TEAM_ID="${LINEAR_TEAM_ID:-1a042dce-47d0-426a-9236-d18187f9f1de}"  # todoapp team

# Check if Linear API key is set
if [ -z "$LINEAR_API_KEY" ]; then
    echo "⚠️  Warning: LINEAR_API_KEY environment variable is not set"
    echo "   Please set it before running this script:"
    echo "   export LINEAR_API_KEY='your-api-key'"
    exit 1
fi

# Change to scripts directory
cd "$SCRIPT_DIR"

# Run the Node.js example
echo "🚀 Running Linear integration examples..."
echo ""
node linear-integration-example.js

