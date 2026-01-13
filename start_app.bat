@echo off
title SOC Defect Reporter Launcher
echo ==============================================
echo   Starting SOC Defect Reporter (Backend + Frontend)
echo ==============================================

:: 1. Start the Python Backend
:: Restored: Goes into 'backend' folder and runs 'server.py'
echo Starting Python Backend...
start "Python Backend" cmd /k "cd backend && python server.py"

:: 2. Start the Next.js Frontend
:: CRITICAL FIX: Added "-- -H 0.0.0.0" so your phone can connect!
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "npm run dev -- -H 0.0.0.0"

echo.
echo ✅ Servers are launching...
echo 📱 Access on Phone: http://172.20.10.3:3000
pause