@echo off
echo Starting Full Project...

start cmd /k run_backend.bat
timeout /t 5
start cmd /k run_frontend.bat
