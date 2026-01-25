#!/bin/bash
# AI Designer Backend Server Startup Script
# تشغيل خادم AI Designer

echo "🚀 Starting AI Designer Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment if exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Virtual environment activated"
fi

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo "🌐 Server starting at http://localhost:8001"
echo "📄 Dashboard: http://localhost:8001/app.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --port 8001 --host 0.0.0.0
