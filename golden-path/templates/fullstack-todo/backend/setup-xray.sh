#!/bin/bash

# AWS X-Ray Setup Script for Local Development
# This script downloads and starts the X-Ray daemon for macOS

set -e

echo "🚀 Setting up AWS X-Ray for local development..."

# Check if X-Ray daemon is already running
if lsof -i :2000 | grep -q LISTEN; then
    echo "✅ X-Ray daemon is already running on port 2000"
    exit 0
fi

# Create directory for X-Ray daemon
XRAY_DIR="$HOME/.xray-daemon"
mkdir -p "$XRAY_DIR"
cd "$XRAY_DIR"

# Check if daemon already exists
if [ -f "./xray" ]; then
    echo "📦 X-Ray daemon binary found, starting..."
else
    echo "📥 Downloading X-Ray daemon for macOS..."
    curl -L https://s3.dualstack.us-east-1.amazonaws.com/aws-xray-assets.us-east-1/xray-daemon/aws-xray-daemon-macos-3.x.zip -o xray-daemon.zip
    
    echo "📦 Extracting X-Ray daemon..."
    unzip -q -o xray-daemon.zip
    
    # Find the xray binary (macOS zip contains xray_mac)
    if [ -f "./xray" ]; then
        XRAY_BINARY="./xray"
    elif [ -f "./xray_mac" ]; then
        mv ./xray_mac ./xray
        XRAY_BINARY="./xray"
    elif [ -f "./xray-daemon-macos/xray" ]; then
        XRAY_BINARY="./xray-daemon-macos/xray"
        mv "$XRAY_BINARY" ./xray
    else
        # Try to find it
        XRAY_BINARY=$(find . -name "xray*" -type f ! -name "*.zip" ! -name "*.yaml" ! -name "*.txt" | head -1)
        if [ -z "$XRAY_BINARY" ]; then
            echo "❌ Could not find xray binary after extraction"
            ls -la
            exit 1
        fi
        if [ "$XRAY_BINARY" != "./xray" ]; then
            mv "$XRAY_BINARY" ./xray
        fi
    fi
    
    # Make it executable
    chmod +x xray
fi

# Start X-Ray daemon in background
echo "▶️  Starting X-Ray daemon..."
nohup ./xray -o > xray.log 2>&1 &
DAEMON_PID=$!

# Wait a moment for daemon to start
sleep 2

# Check if daemon is running
if ps -p $DAEMON_PID > /dev/null; then
    echo "✅ X-Ray daemon started successfully (PID: $DAEMON_PID)"
    echo "📝 Logs: $XRAY_DIR/xray.log"
    echo ""
    echo "To stop the daemon: kill $DAEMON_PID"
    echo "Or use: pkill -f 'xray -o'"
else
    echo "❌ Failed to start X-Ray daemon"
    cat xray.log 2>/dev/null || true
    exit 1
fi

# Verify port is listening
if lsof -i :2000 | grep -q LISTEN; then
    echo "✅ X-Ray daemon is listening on port 2000"
else
    echo "⚠️  Warning: X-Ray daemon may not be listening on port 2000"
fi

echo ""
echo "✨ Setup complete! Your application can now send traces to X-Ray."
echo ""
echo "Environment variables to set:"
echo "  export ENABLE_XRAY=true"
echo "  export SERVICE_NAME=todo-api"
echo "  export AWS_XRAY_DEBUG_MODE=1  # optional, for verbose logging"
echo ""
echo "Then restart your backend server."

