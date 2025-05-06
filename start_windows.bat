@echo off
REM Smart Dynamic Pricing System Startup Script for Windows
REM This script starts both the backend and frontend components

echo Starting Smart Dynamic Pricing System...

REM Create virtual environment if it doesn't exist
if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
pip install -r backend\requirements.txt

REM Start backend server in the background
echo Starting backend server...
start /B python backend\enhanced_api.py

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

REM Change to frontend directory
cd frontend

REM Install frontend dependencies if node_modules doesn't exist
if not exist node_modules (
  echo Installing frontend dependencies...
  call npm install
)

REM Start frontend development server
echo Starting frontend server...
call npm start

REM Keep the window open
pause
