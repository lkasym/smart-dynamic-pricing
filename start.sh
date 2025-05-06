#!/bin/bash

# Smart Dynamic Pricing System Startup Script
# This script starts both the backend and frontend components

echo "Starting Smart Dynamic Pricing System..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Start backend server in the background
echo "Starting backend server..."
cd backend
python enhanced_api.py &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 3

# Install frontend dependencies if node_modules doesn't exist
cd frontend
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Start frontend development server
echo "Starting frontend server..."
npm start

# Cleanup function to kill backend when script is terminated
cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  exit 0
}

# Register cleanup function for script termination
trap cleanup SIGINT SIGTERM

# Wait for frontend to exit
wait
