@echo off
title Stop SOC Defect Reporter
echo ==============================================
echo   STOPPING SOC Defect Reporter...
echo ==============================================

:: 1. Force kill Python (Stops Backend)
echo 🛑 Killing Python Backend...
taskkill /F /IM python.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo    - Backend Stopped.
) else (
    echo    - Backend was not running.
)

:: 2. Force kill Node.js (Stops Frontend)
echo 🛑 Killing Next.js Frontend...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo    - Frontend Stopped.
) else (
    echo    - Frontend was not running.
)

echo.
echo ✅ All servers are OFF.
echo (You can close the black command windows now).
echo.
pause