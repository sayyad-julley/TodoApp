#!/bin/bash

# Development Startup Script for TodoApp
# This script ensures both MongoDB and backend services are properly started

echo "🚀 Starting TodoApp Development Environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "📦 Starting Docker Desktop..."
    open -a "Docker Desktop"

    # Wait for Docker to be ready
    for i in {1..30}; do
        if docker info >/dev/null 2>&1; then
            echo "✅ Docker daemon is ready!"
            break
        fi
        echo "⏳ Waiting for Docker daemon... ($i/30)"
        sleep 3
    done

    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker failed to start. Please start Docker Desktop manually."
        exit 1
    fi
fi

# Start MongoDB container
echo "🗄️ Starting MongoDB container..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..15}; do
    if docker exec todoapp-mongo mongosh --eval "db.runCommand({ping: 1})" admin >/dev/null 2>&1; then
        echo "✅ MongoDB is ready!"
        break
    fi
    echo "⏳ Waiting for MongoDB... ($i/15)"
    sleep 2
done

# Start backend server
echo "🔧 Starting backend server..."
cd backend
pkill -f "node server.js" 2>/dev/null || true
sleep 2
node server.js > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend server..."
for i in {1..10}; do
    if curl -s http://localhost:5000/health >/dev/null 2>&1; then
        echo "✅ Backend server is ready!"
        break
    fi
    echo "⏳ Waiting for backend... ($i/10)"
    sleep 2
done

# Check if frontend is running
if ! lsof -i :5143 >/dev/null 2>&1; then
    echo "⚠️ Frontend is not running. Please start it with:"
    echo "   cd frontend && npm run dev"
else
    echo "✅ Frontend is already running on port 5143"
fi

echo ""
echo "🎉 TodoApp Development Environment is Ready!"
echo ""
echo "📍 Services:"
echo "   • Frontend: http://localhost:5143"
echo "   • Backend:  http://localhost:5000"
echo "   • MongoDB: localhost:27017"
echo ""
echo "🔧 Backend PID: $BACKEND_PID"
echo "📋 Backend logs: backend/backend.log"
echo ""
echo "✨ Test the application:"
echo "   curl http://localhost:5143/api/auth/register -d '{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}' -H 'Content-Type: application/json'"
echo ""