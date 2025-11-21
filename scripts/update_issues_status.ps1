<#
    Script para atualizar status de issues baseado no STATUS_BACKLOG.md
    Fecha issues concluídas e atualiza labels conforme o status atual.
    
    Uso:
    $env:GITHUB_TOKEN="ghp_..."
    pwsh ./scripts/update_issues_status.ps1 [-DryRun]
    
    Ou interativo (pedirá o token):
    pwsh ./scripts/update_issues_status.ps1
#>

param(
    [switch]$DryRun
)

# Configuração
$repoOwner = "fabioaap"
$repoName = "FinanceAI"

# Issues concluídas (baseado em STATUS_BACKLOG.md)
$completedIssues = @(33, 34, 35, 36, 37, 38, 39, 42)

# Issues pendentes/futuro
$pendingIssues = @(
    @{ number = 40; labels = @("future", "optimization", "performance") },
    @{ number = 41; labels = @("future", "feature", "sync") }
)

# Verificar token
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "GITHUB_TOKEN não encontrado nas variáveis de ambiente." -ForegroundColor Yellow
    $token = Read-Host "Cole seu GitHub Personal Access Token" -AsSecureString
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    )
}

$headers = @{
    "Authorization" = "token $token"
    "Accept"        = "application/vnd.github.v3+json"
}

Write-Host "`n🔄 Atualizando status das issues do FinanceAI..." -ForegroundColor Cyan
Write-Host "Repositório: $repoOwner/$repoName`n" -ForegroundColor Gray

# Função para fechar issue
function Close-Issue([int]$issueNumber) {
    if ($DryRun) {
        Write-Host "[dry-run] Fecharia issue #$issueNumber" -ForegroundColor Yellow
        return $true
    }
    
    $url = "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber"
    $body = @{
        state = "closed"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Patch -Body $body -ContentType "application/json"
        return $true
    }
    catch {
        Write-Host "  ❌ Erro: $_" -ForegroundColor Red
        return $false
    }
}

# Função para adicionar comment
function Add-IssueComment([int]$issueNumber, [string]$comment) {
    if ($DryRun) {
        Write-Host "[dry-run] Adicionaria comentário na issue #$issueNumber" -ForegroundColor Yellow
        return $true
    }
    
    $url = "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber/comments"
    $body = @{
        body = $comment
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body -ContentType "application/json"
        return $true
    }
    catch {
        return $false
    }
}

# Função para adicionar labels
function Add-IssueLabels([int]$issueNumber, [string[]]$labels) {
    if ($DryRun) {
        Write-Host "[dry-run] Adicionaria labels na issue #$issueNumber : $($labels -join ', ')" -ForegroundColor Yellow
        return $true
    }
    
    $url = "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber/labels"
    $body = @{
        labels = $labels
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body -ContentType "application/json"
        return $true
    }
    catch {
        return $false
    }
}

# Processar issues concluídas
Write-Host "✅ Fechando issues concluídas (80% do backlog):" -ForegroundColor Green
$closedCount = 0
foreach ($issueNum in $completedIssues) {
    Write-Host "  Issue #$issueNum" -NoNewline
    
    $comment = @"
✅ **Issue concluída!**

Implementação finalizada e testada. Veja detalhes em \`docs/STATUS_BACKLOG.md\`.

**Status:** 80% do backlog completo (8/10 issues)
**Data:** $(Get-Date -Format "yyyy-MM-dd")
"@
    
    if (Add-IssueComment -issueNumber $issueNum -comment $comment) {
        Write-Host " - Comentário adicionado" -ForegroundColor Gray -NoNewline
    }
    
    if (Close-Issue -issueNumber $issueNum) {
        Write-Host " - ✅ Fechada" -ForegroundColor Green
        $closedCount++
    }
    else {
        Write-Host " - ⚠️  Falhou" -ForegroundColor Yellow
    }
}

# Processar issues pendentes
Write-Host "`n⏳ Atualizando labels das issues pendentes:" -ForegroundColor Cyan
foreach ($issue in $pendingIssues) {
    Write-Host "  Issue #$($issue.number)" -NoNewline
    
    if (Add-IssueLabels -issueNumber $issue.number -labels $issue.labels) {
        Write-Host " - Labels atualizadas: $($issue.labels -join ', ')" -ForegroundColor Gray
    }
    else {
        Write-Host " - ⚠️  Falhou" -ForegroundColor Yellow
    }
}

# Resumo final
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
if ($DryRun) {
    Write-Host "✅ [DRY-RUN] Simulação concluída!" -ForegroundColor Yellow
    Write-Host "Nenhuma issue foi modificada. Execute sem -DryRun para aplicar." -ForegroundColor Yellow
}
else {
    Write-Host "✅ Atualização concluída!" -ForegroundColor Green
    Write-Host "Issues fechadas: $closedCount / $($completedIssues.Count)" -ForegroundColor Green
    Write-Host "Issues pendentes atualizadas: $($pendingIssues.Count)" -ForegroundColor Cyan
}

Write-Host "`n📊 Progresso do projeto: 80% (8/10 issues)" -ForegroundColor Magenta
Write-Host "🔗 GitHub Project: https://github.com/users/$repoOwner/projects/2" -ForegroundColor Cyan
Write-Host "🔗 Issues: https://github.com/$repoOwner/$repoName/issues" -ForegroundColor Cyan
Write-Host ""
