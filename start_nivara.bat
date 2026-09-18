@echo off
title NIVARA Platform Launcher
echo ======================================================================
echo           Starting NIVARA Disaster Intelligence Platform
echo ======================================================================

echo [1/2] Starting FastAPI Backend on port 8000...
start "NIVARA Backend" cmd /k ".venv\Scripts\uvicorn.exe backend.app.api.endpoints:app --reload --port 8000"

echo [2/2] Starting Frontend Vite Server on port 3000...
start "NIVARA Frontend" cmd /k "npm.cmd --prefix frontend run dev"

echo.
echo NIVARA is launching:
echo   - Frontend: http://localhost:3000
echo   - Backend Docs: http://localhost:8000/docs
echo ======================================================================
