@echo off
REM ML Setup & Start Script for Windows
REM This script handles the complete setup for ML-based priority prediction

set BACKEND_DIR=C:\path\to\BACKEND
set ML_DIR=%BACKEND_DIR%\ml_model
set REACT_DIR=%BACKEND_DIR%\react\my-app

echo.
echo 🚀 Setting up ML-Based Complaint Priority System...
echo.

REM Step 1: Install Python dependencies
echo Step 1: Installing Python dependencies...
cd /d %ML_DIR%
pip install -r requirements.txt > nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ Python dependencies installed
) else (
    echo ⚠ Python dependencies installation may need manual attention
)
echo.

REM Step 2: Train ML model
echo Step 2: Training ML model...
python train_model.py
if exist "%ML_DIR%\priority_model.pkl" (
    echo ✓ ML model trained and saved
) else (
    echo ⚠ Model file not found
)
echo.

REM Step 3: Install Node dependencies
echo Step 3: Installing Node.js dependencies...
cd /d %BACKEND_DIR%
call npm install > nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✓ Node.js dependencies installed
) else (
    echo ⚠ Node.js dependencies installation may need manual attention
)
echo.

REM Step 4: Show next steps
echo ===============================================
echo ✓ Setup Complete!
echo ===============================================
echo.
echo Next: Start the services in separate terminals:
echo.
echo Terminal 1 - ML API Server:
echo cd %ML_DIR% ^&^& python app.py
echo.
echo Terminal 2 - Node.js Backend:
echo cd %BACKEND_DIR% ^&^& node index.js
echo.
echo Terminal 3 - React Frontend:
echo cd %REACT_DIR% ^&^& npm start
echo.
echo Service URLs:
echo   ML API:        http://localhost:5001
echo   Backend:       http://localhost:5000
echo   Frontend:      http://localhost:3000
echo.
pause
