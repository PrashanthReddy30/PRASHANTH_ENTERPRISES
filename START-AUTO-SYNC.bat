@echo off
title Prashanth Enterprises HRM — GitHub Auto-Sync
color 0A
echo.
echo  =====================================================
echo   PRASHANTH ENTERPRISES HRM — GitHub Auto-Sync
echo   Watching for code changes and pushing to GitHub...
echo  =====================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"
pause
