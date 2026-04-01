@echo off
title Garuda Electricals - Starting Services
color 0A

echo ========================================
echo   GARUDA ELECTRICALS - STARTING UP
echo ========================================
echo.

:: Change to script directory
cd /d "%~dp0"

echo [1/4] Checking Node.js and Python...
where node >nul 2>&1 && echo   - Node.js: FOUND || echo   - Node.js: NOT FOUND
where python >nul 2>&1 && echo   - Python: FOUND || echo   - Python: NOT FOUND
echo.

:: Install Frontend Dependencies
echo [2/4] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo   ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo   Frontend dependencies installed successfully!
echo.

:: Install Backend Dependencies
echo [3/4] Installing Backend Dependencies...
cd ..\backend
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo   ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo   Backend dependencies installed successfully!
echo.

echo [4/4] Starting Services...
echo.

:: Start Backend Server
echo   Starting Backend Server (FastAPI)...
start "Garuda Backend" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Start Frontend Server
echo   Starting Frontend Server (Vite)...
start "Garuda Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   SERVICES STARTED!
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: Check the frontend terminal
echo   API Docs: http://localhost:8000/docs
echo.
echo   Close this window to stop the launcher.
echo   Use Task Manager to stop backend/frontend if needed.
echo ========================================
pause
