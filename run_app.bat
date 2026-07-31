@echo off
TITLE Costing Calculator App Launcher
COLOR 0A

echo =========================================================================
echo       Industrial Manufacturing Costing Engine - Application Launcher
echo =========================================================================
echo.

:: Check if Docker is available and running
docker info >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker daemon detected. Starting full stack via Docker Compose...
    docker compose up --build
    GOTO :END
)

echo [INFO] Running local development servers...
echo.

echo Launching FastAPI Backend (http://localhost:8000)...
start "Costing Engine Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Launching Next.js Frontend (http://localhost:3000)...
start "Costing Engine Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo Both services launched successfully!
echo - Backend API:  http://localhost:8000
echo - Frontend UI:   http://localhost:3000
echo =========================================================================

:END
