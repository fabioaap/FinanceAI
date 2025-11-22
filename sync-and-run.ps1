# Script para sincronizar e rodar o app
Write-Host "🔄 Sincronizando com o servidor..." -ForegroundColor Cyan
git pull origin copilot/create-data-abstraction-layer

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Código atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Iniciando o servidor de desenvolvimento..." -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "❌ Erro ao sincronizar. Execute manualmente:" -ForegroundColor Red
    Write-Host "git pull origin copilot/create-data-abstraction-layer" -ForegroundColor Yellow
}
