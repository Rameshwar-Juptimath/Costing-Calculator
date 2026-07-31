@echo off
TITLE Costing Calculator App Launcher
COLOR 0A

echo =========================================================================
echo       Industrial Manufacturing Costing Engine - Application Launcher
echo =========================================================================
echo.

echo [1/2] Starting Backend API (CadQuery + OpenCASCADE) & Database via Docker...
docker compose up -d backend db

echo.
echo [2/2] Building Next.js Frontend (npm run build) and starting server...
start "Costing Engine Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run build && npm run start"

echo.
echo =========================================================================
echo Both services launched successfully!
echo - Backend API:  http://localhost:8000 (Swagger docs at /docs)
echo - Frontend UI:   http://localhost:3000
echo =========================================================================
