@echo off
title StudyMate AI - Production Server
echo ========================================================
echo   StudyMate AI - Production Server
echo ========================================================
echo.
set "PATH=C:\Users\Dileep Sai\.nodejs\v22\node-v22.14.0-win-x64;C:\Users\Dileep Sai\.nodejs\node-v20.18.0-win-x64;%PATH%"

echo Starting StudyMate AI server on http://localhost:5001 ...
echo.
node server.cjs
pause
