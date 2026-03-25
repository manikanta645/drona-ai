#!/bin/bash
# VIDYA System Startup Script
# Starts both backend and frontend servers

echo "🚀 DRONA-AI VIDYA System Startup"
echo "=================================="
echo ""

# Check if running on Windows (PowerShell)
if [[ "$OSTYPE" == "win32" || "$OSTYPE" == "msys" ]]; then
    echo "⚠️ Windows detected. Please run the PowerShell version instead."
    echo ""
    echo "Run these commands in separate PowerShell windows:"
    echo "1. Backend: cd backend && python main.py"
    echo "2. Frontend: cd frontend/drona-ui && npm start"
    exit 0
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python not found. Please install Python 3.8+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found${NC}"

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found${NC}"

echo ""
echo "Starting VIDYA Services..."
echo ""

# Start Backend
echo -e "${YELLOW}📦 Starting Backend...${NC}"
cd backend
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 2

# Check backend health
HEALTH=$(curl -s http://localhost:8000/api/vidya/health | grep -o "healthy")
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}⚠️ Backend health check pending...${NC}"
fi

cd ..

echo ""

# Start Frontend
echo -e "${YELLOW}⚛️ Starting Frontend...${NC}"
cd frontend/drona-ui
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend starting (PID: $FRONTEND_PID)${NC}"

cd ../..

echo ""
echo -e "${GREEN}=================================="
echo "✨ VIDYA System is Starting!"
echo "=================================="
echo ""
echo "📊 Services:"
echo "  Backend:  http://localhost:8000"
echo "  API:      http://localhost:8000/api/vidya"
echo "  Frontend: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
