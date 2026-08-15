# ThoughtWeb Navigator - Unified Runner Script
# This script launches both the FastAPI backend and the Vite frontend in separate terminal windows.

$ErrorActionPreference = "Stop"

Write-Host "--- Starting ThoughtWeb Navigator ---" -ForegroundColor Cyan

# 1. Start FastAPI Backend
Write-Host "[1/3] Launching FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- FastAPI Backend ---' -ForegroundColor Yellow; cd backend_fastapi; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1" -WindowStyle Normal

# 2. Start Vite Frontend
Write-Host "[2/3] Launching Vite Frontend on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- Vite Frontend ---' -ForegroundColor Cyan; cd frontend; npm run dev" -WindowStyle Normal

Write-Host "`nFull Application is starting. Please check the new terminal windows." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Gray
