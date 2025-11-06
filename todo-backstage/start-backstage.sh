#!/bin/bash

# Backstage Startup Script
# This script loads environment variables and starts Backstage

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env file if it exists
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  WARNING: GITHUB_TOKEN is not set!"
    echo ""
    echo "Please set your GitHub token using one of these methods:"
    echo "1. Run: ./setup-env.sh"
    echo "2. Export manually: export GITHUB_TOKEN=your-token-here"
    echo "3. Create .env file with: GITHUB_TOKEN=your-token-here"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Startup cancelled. Please set GITHUB_TOKEN first."
        exit 1
    fi
else
    echo "✅ GITHUB_TOKEN is set"
fi

echo ""
echo "🚀 Starting Backstage..."
echo ""

# Check if package.json exists in current directory
if [ -f package.json ]; then
    # We're in a Backstage app directory
    BACKSTAGE_DIR="$SCRIPT_DIR"
elif [ -f ../todo-template/package.json ]; then
    # Use todo-template if it exists
    echo "ℹ️  Using todo-template directory (package.json found there)"
    BACKSTAGE_DIR="$(cd ../todo-template && pwd)"
    cd "$BACKSTAGE_DIR"
else
    echo "❌ Error: No package.json found in current directory or ../todo-template"
    echo "   Please run this script from the Backstage app root directory"
    exit 1
fi

# Start Backstage
if command -v yarn &> /dev/null; then
    yarn start
elif command -v npm &> /dev/null; then
    npm start
else
    echo "❌ Error: Neither yarn nor npm found. Please install Node.js package manager."
    exit 1
fi

