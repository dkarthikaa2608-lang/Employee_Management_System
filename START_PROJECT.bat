@echo off
title Employee Management System

echo ==========================================
echo   Employee Management System
echo ==========================================
echo.

cd /d "%~dp0Frontend\Backend"

echo Installing required package...
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo Flask installation failed.
    echo Please make sure Python is installed and added to PATH.
    pause
    exit /b 1
)

echo.
echo Starting Employee Management System...
echo.
echo Open in Chrome:
echo http://127.0.0.1:5000
echo.
echo Press Ctrl+C to stop the server.
echo.

python app.py
pause
