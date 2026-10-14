@echo off
title StudyMate AI - Build Production
echo ========================================================
echo   StudyMate AI - Build Production Bundle
echo ========================================================
echo.
set "PATH=C:\Users\Dileep Sai\.nodejs\v22\node-v22.14.0-win-x64;C:\Users\Dileep Sai\.nodejs\node-v20.18.0-win-x64;%PATH%"

echo Building TypeScript and Vite bundles...
npm run build
echo.
echo Build complete! You can now run start.bat to launch the app.
pause
