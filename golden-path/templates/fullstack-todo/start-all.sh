#!/bin/bash

# Script to start all services: X-Ray daemon, backend, and frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 Starting all TodoApp services..."
echo ""

# 1. Start X-Ray Daemon
echo "📊 Starting X-Ray daemon..."
if lsof -i :2000 | grep -q LISTEN; then
    echo "✅ X-Ray daemon already running on port 2000"
else
    cd "$BACKEND_DIR"
    ./setup-xray.sh > /dev/null 2>&1
    sleep 2
    if lsof -i :2000 | grep -q LISTEN; then
        echo "✅ X-Ray daemon started on port 2000"
    else
        echo "❌ Failed to start X-Ray daemon"
        exit 1
    fi
fi

# 2. Start Backend Server
echo ""
echo "🔧 Starting backend server on port 5000..."
cd "$BACKEND_DIR"

# Kill any existing backend process
lsof -ti :5000 | xargs kill -9 2>/dev/null || true
sleep 1

# Set X-Ray environment variables
export ENABLE_XRAY=true
export SERVICE_NAME=todo-api
export AWS_XRAY_DEBUG_MODE=1
export AWS_XRAY_DAEMON_ADDRESS=localhost:2000
export NODE_ENV=development
export PORT=5000

# Start backend in background
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Logs: $BACKEND_DIR/backend.log"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..15}; do
    if curl -s http://localhost:5000/health >/dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "⚠️  Backend may still be starting..."
    else
        sleep 1
    fi
done

# 3. Start Frontend Server
echo ""
echo "🎨 Starting frontend server on port 5143..."
cd "$FRONTEND_DIR"

# Kill any existing frontend process
lsof -ti :5143 | xargs kill -9 2>/dev/null || true
sleep 1

# Start frontend in background
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Logs: $FRONTEND_DIR/frontend.log"

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
for i in {1..20}; do
    if curl -s http://localhost:5143 >/dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "⚠️  Frontend may still be starting..."
    else
        sleep 2
    fi
done

echo ""
echo "🎉 All services started!"
echo ""
echo "📍 Services:"
echo "   • Frontend:  http://localhost:5143"
echo "   • Backend:   http://localhost:5000"
echo "   • X-Ray:     http://localhost:2000 (daemon)"
echo ""
echo "📋 Process IDs:"
echo "   • Backend PID:  $BACKEND_PID"
echo "   • Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   • Backend:  tail -f $BACKEND_DIR/backend.log"
echo "   • Frontend: tail -f $FRONTEND_DIR/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $BACKEND_PID $FRONTEND_PID && pkill -f 'xray -o'"
echo ""

