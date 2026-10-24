@echo off
title Sree Annapurna Agency - Dependency Installer
echo ===============================================================
echo Installing dependencies for Root, Frontend, and Backend...
echo ===============================================================
call npm.cmd install
cd frontend
call npm.cmd install
cd ..\backend
call npm.cmd install
cd ..
echo.
echo ===============================================================
echo All dependencies installed successfully!
echo You can now start the application by running: .\dev.bat
echo ===============================================================
pause

