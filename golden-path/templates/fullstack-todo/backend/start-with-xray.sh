#!/bin/bash

# Script to start the backend server with X-Ray enabled

cd "$(dirname "$0")"

echo "🚀 Starting backend server with AWS X-Ray enabled..."

# Export X-Ray environment variables
export ENABLE_XRAY=true
export SERVICE_NAME=todo-api
export AWS_XRAY_DEBUG_MODE=1
export AWS_XRAY_DAEMON_ADDRESS=localhost:2000

# Check if X-Ray daemon is running
if ! lsof -i :2000 | grep -q LISTEN; then
    echo "⚠️  Warning: X-Ray daemon is not running on port 2000"
    echo "   Run ./setup-xray.sh first to start the daemon"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the server
if command -v nodemon &> /dev/null; then
    echo "📦 Starting with nodemon..."
    nodemon server.js
else
    echo "📦 Starting with node..."
    node server.js
fi

