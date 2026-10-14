@echo off
title StudyMate AI - Development Mode
echo ========================================================
echo   StudyMate AI - Development Server
echo ========================================================
echo.
set "PATH=C:\Users\Dileep Sai\.nodejs\v22\node-v22.14.0-win-x64;C:\Users\Dileep Sai\.nodejs\node-v20.18.0-win-x64;%PATH%"

echo Checking Node.js version...
node -v
echo.
echo Starting StudyMate AI Development Servers...
echo - Express Backend: http://localhost:5001
echo - Vite Dev Client: http://localhost:3000
echo.
npm run dev
pause
