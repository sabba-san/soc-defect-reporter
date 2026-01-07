@echo off
title SOC Defect Reporter Launcher
echo ==============================================
echo   Starting SOC Defect Reporter (Backend + Frontend)
echo ==============================================

:: 1. Start the Python Backend (Go INTO the 'backend' folder)
echo Starting Python Backend...
start "Python Backend" cmd /k "cd backend && python server.py"

:: 2. Start the Next.js Frontend
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo ✅ Servers are launching!
