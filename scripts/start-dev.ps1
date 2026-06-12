# Start EverX CRM local stack (H2 in-memory DB by default)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting backend (profile: h2)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\backend'; mvn spring-boot:run `"-Dspring-boot.run.arguments=--spring.profiles.active=h2`""
)

Start-Sleep -Seconds 3

Write-Host "Starting frontend (Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\frontend'; if (-not (Test-Path node_modules)) { npm install }; npm run dev"
)

Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Login:    admin@everx.com / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "PostgreSQL (optional): docker compose up -d postgres" -ForegroundColor DarkGray
Write-Host "Then run backend with: SPRING_PROFILES_ACTIVE=default" -ForegroundColor DarkGray
