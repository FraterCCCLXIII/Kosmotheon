#!/bin/bash

# Development startup script for Kosmotheon
# Starts both MkDocs server and Live Edit server

echo "🚀 Starting Kosmotheon Development Environment"
echo "=============================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $MKDOCS_PID 2>/dev/null
    kill $LIVE_EDIT_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Please stop the service using port $1 and try again."
        exit 1
    fi
}

echo "🔍 Checking ports..."
check_port 8001
check_port 8002

echo "✅ Ports available"

# Start Live Edit Server
echo "🔧 Starting Live Edit Server on port 8002..."
python3 live_edit_server.py 8002 &
LIVE_EDIT_PID=$!

# Wait a moment for the server to start
sleep 2

# Start MkDocs Server
echo "📚 Starting MkDocs Server on port 8001..."
mkdocs serve --dev-addr=127.0.0.1:8001 &
MKDOCS_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "🌐 MkDocs Server: http://127.0.0.1:8001"
echo "🔧 Live Edit Server: http://127.0.0.1:8002"
echo ""
echo "✏️  Live Edit features will be available on localhost"
echo "📝 You can now edit content directly in the browser"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for background processes
wait 