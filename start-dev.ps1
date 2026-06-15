# Запуск бэкенда и фронтенда для разработки
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=== Orion Lemonade: запуск dev-серверов ===" -ForegroundColor Cyan

# Бэкенд
Write-Host "`nЗапуск API (http://localhost:5162)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "dotnet" `
    -ArgumentList "run --project `"$root\src\server\src\API\OrionLemonade.API`"" `
    -WorkingDirectory "$root\src\server" `
    -PassThru `
    -WindowStyle Normal

Start-Sleep -Seconds 3

# Фронтенд
Write-Host "Запуск клиента (http://localhost:5173)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "npm" `
    -ArgumentList "run dev" `
    -WorkingDirectory "$root\src\client" `
    -PassThru `
    -WindowStyle Normal

Write-Host "`nГотово!" -ForegroundColor Green
Write-Host "  API:    http://localhost:5162"
Write-Host "  Клиент: http://localhost:5173"
Write-Host "  Логин:  admin / admin123"
Write-Host "`nЗакройте окна терминалов, чтобы остановить серверы."
