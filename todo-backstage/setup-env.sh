#!/bin/bash

# Backstage Environment Setup Script
# This script helps you set up your GitHub token for Backstage

echo "🔧 Backstage Environment Setup"
echo "================================"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo ""
echo "📝 Setting up GitHub Token"
echo ""
echo "To get a GitHub Personal Access Token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select the 'repo' scope"
echo "4. Generate and copy the token"
echo ""

read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token cannot be empty. Setup cancelled."
    exit 1
fi

# Create .env file
cat > .env << EOF
# GitHub Integration
# Get your token from: https://github.com/settings/tokens
# Required scopes: repo
GITHUB_TOKEN=$GITHUB_TOKEN

# Traycer AI Integration (Optional)
# TRAYCER_API_URL=https://api.traycer.ai
# TRAYCER_API_KEY=your-traycer-api-key-here
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. The token is saved in .env file"
echo "2. To use it, run: source .env && yarn start"
echo "   OR export it manually: export GITHUB_TOKEN=$GITHUB_TOKEN"
echo "   OR use the startup script: ./start-backstage.sh"
echo ""
echo "⚠️  Note: Backstage reads environment variables when it starts."
echo "   Make sure to export GITHUB_TOKEN before starting Backstage."
echo ""

