@echo off
REM Run AFTER closing Cursor completely.
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\xampp\htdocs\ulnovatech\scripts\complete-local-rebrand-renames.ps1"
if errorlevel 1 (
  echo.
  echo FAILED. If the path already moved, open Cursor on C:\xampp\htdocs\sleeklybuilt
  pause
  exit /b 1
)
echo.
echo SUCCESS. Open Cursor on C:\xampp\htdocs\sleeklybuilt
pause
