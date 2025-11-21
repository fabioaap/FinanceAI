<#
    Script completo para sincronizar GitHub com STATUS_BACKLOG.md
    - Fecha issues concluídas com comentário
    - Atualiza labels
    - Move cards no kanban do projeto
    
    Uso:
    $env:GITHUB_TOKEN="ghp_..."
    pwsh ./scripts/sync_github_status.ps1 -ProjectNumber 2 -Owner fabioaap [-DryRun]
#>

param(
    [int]$ProjectNumber = 2,
    [string]$Owner = "fabioaap",
    [switch]$DryRun
)

$repoOwner = "fabioaap"
$repoName = "FinanceAI"

# Configuração baseada em STATUS_BACKLOG.md
$completedIssues = @(33, 34, 35, 36, 37, 38, 39, 42)
$pendingIssues = @(
    @{ number = 40; labels = @("future", "optimization", "performance") },
    @{ number = 41; labels = @("future", "feature", "sync") }
)

$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "GITHUB_TOKEN não encontrado." -ForegroundColor Yellow
    $token = Read-Host "Cole seu GitHub Personal Access Token" -AsSecureString
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    )
}

$restHeaders = @{
    "Authorization" = "token $token"
    "Accept"        = "application/vnd.github.v3+json"
}

$graphqlHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

Write-Host "`n🚀 Sincronizando GitHub com STATUS_BACKLOG.md..." -ForegroundColor Cyan
Write-Host "Repositório: $repoOwner/$repoName" -ForegroundColor Gray
Write-Host "Project: #$ProjectNumber (owner: $Owner)`n" -ForegroundColor Gray

# ============================================================================
# PARTE 1: ATUALIZAR ISSUES (fechar + labels + comentários)
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📝 PARTE 1: Atualizando Issues" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

function Close-Issue([int]$issueNumber) {
    if ($DryRun) {
        Write-Host "[dry-run] Fecharia issue #$issueNumber" -ForegroundColor Yellow
        return $true
    }
    
    $url = "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber"
    $body = @{ state = "closed" } | ConvertTo-Json
    
    try {
        $null = Invoke-RestMethod -Uri $url -Headers $restHeaders -Method Patch -Body $body -ContentType "application/json"
        return $true
    }
    catch { return $false }
}

function Add-IssueComment([int]$issueNumber, [string]$comment) {
    if ($DryRun) { return $true }
    
    $url = "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber/comments"
    $body = @{ body = $comment } | ConvertTo-Json
    
    try {
        $null = Invoke-RestMethod -Uri $url -Headers $restHeaders -Method Post -Body $body -ContentType "application/json"
        return $true
    }
    catch { return $false }
}

function Add-IssueLabels([int]$issueNumber, [string[]]$labels) {
    if ($DryRun) { return $true }
    
    $url = "https://api.github.com/repos/$repoOwner/$repoName/issues/$issueNumber/labels"
    $body = @{ labels = $labels } | ConvertTo-Json
    
    try {
        $null = Invoke-RestMethod -Uri $url -Headers $restHeaders -Method Post -Body $body -ContentType "application/json"
        return $true
    }
    catch { return $false }
}

Write-Host "`n✅ Fechando issues concluídas:" -ForegroundColor Green
$closedCount = 0
foreach ($issueNum in $completedIssues) {
    Write-Host "  #$issueNum" -NoNewline
    
    $comment = "✅ **Concluída!**`n`nImplementação finalizada. Detalhes em ``docs/STATUS_BACKLOG.md``.`n`n**Progresso:** 80% (8/10 issues) | **Data:** $(Get-Date -Format 'yyyy-MM-dd')"
    
    if (Add-IssueComment -issueNumber $issueNum -comment $comment) {
        Write-Host " → comentário" -ForegroundColor Gray -NoNewline
    }
    
    if (Close-Issue -issueNumber $issueNum) {
        Write-Host " → ✅ fechada" -ForegroundColor Green
        $closedCount++
    }
    else {
        Write-Host " → ⚠️ falhou" -ForegroundColor Yellow
    }
}

Write-Host "`n🏷️  Atualizando labels das pendentes:" -ForegroundColor Cyan
foreach ($issue in $pendingIssues) {
    Write-Host "  #$($issue.number)" -NoNewline
    
    if (Add-IssueLabels -issueNumber $issue.number -labels $issue.labels) {
        Write-Host " → labels: $($issue.labels -join ', ')" -ForegroundColor Gray
    }
    else {
        Write-Host " → ⚠️ falhou" -ForegroundColor Yellow
    }
}

# ============================================================================
# PARTE 2: ATUALIZAR KANBAN (mover cards)
# ============================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📋 PARTE 2: Atualizando Kanban" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

function Invoke-GraphQL([string]$query) {
    $body = @{ query = $query } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/graphql" `
            -Headers $graphqlHeaders -Method Post -Body $body
        
        if ($response.errors) {
            Write-Host "  GraphQL Error: $($response.errors[0].message)" -ForegroundColor Red
            return $null
        }
        
        return $response.data
    }
    catch { return $null }
}

Write-Host "`n🔍 Buscando estrutura do projeto..." -ForegroundColor Cyan
$projectQuery = @"
{
  user(login: \"$Owner\") {
    projectV2(number: $ProjectNumber) {
      id
      title
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}
"@

$projectData = Invoke-GraphQL -query $projectQuery
if (-not $projectData) {
    Write-Warning "Não foi possível acessar o projeto. Kanban não será atualizado."
}
else {
    $projectId = $projectData.user.projectV2.id
    $projectTitle = $projectData.user.projectV2.title
    Write-Host "  ✅ $projectTitle" -ForegroundColor Green
    
    $statusField = $projectData.user.projectV2.fields.nodes | Where-Object { 
        $_.name -in @("Status", "Estado", "State", "Column") 
    } | Select-Object -First 1
    
    if ($statusField) {
        $doneOption = $statusField.options | Where-Object { 
            $_.name -in @("Done", "✅ Done", "Concluído", "Finished", "Complete") 
        } | Select-Object -First 1
        
        $todoOption = $statusField.options | Where-Object { 
            $_.name -in @("To Do", "Todo", "📝 To Do", "Backlog", "Pending") 
        } | Select-Object -First 1
        
        if ($doneOption) {
            Write-Host "  ✅ Coluna 'Done': $($doneOption.name)" -ForegroundColor Green
            
            function Get-ProjectItemId([int]$issueNumber) {
                $itemQuery = @"
{
  repository(owner: \"$repoOwner\", name: \"$repoName\") {
    issue(number: $issueNumber) {
      projectItems(first: 10) {
        nodes {
          id
          project { id }
        }
      }
    }
  }
}
"@
                $data = Invoke-GraphQL -query $itemQuery
                if (-not $data) { return $null }
                
                $item = $data.repository.issue.projectItems.nodes | Where-Object { 
                    $_.project.id -eq $projectId 
                } | Select-Object -First 1
                
                return $item.id
            }
            
            function Move-ProjectItem([string]$itemId, [string]$statusOptionId) {
                if ($DryRun) { return $true }
                
                $mutation = @"
mutation {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: \"$projectId\"
      itemId: \"$itemId\"
      fieldId: \"$($statusField.id)\"
      value: { singleSelectOptionId: \"$statusOptionId\" }
    }
  ) {
    projectV2Item { id }
  }
}
"@
                $result = Invoke-GraphQL -query $mutation
                return ($null -ne $result)
            }
            
            Write-Host "`n📌 Movendo cards concluídas para 'Done':" -ForegroundColor Green
            $movedCount = 0
            foreach ($issueNum in $completedIssues) {
                Write-Host "  #$issueNum" -NoNewline
                
                $itemId = Get-ProjectItemId -issueNumber $issueNum
                if (-not $itemId) {
                    Write-Host " → não está no projeto" -ForegroundColor DarkGray
                    continue
                }
                
                if (Move-ProjectItem -itemId $itemId -statusOptionId $doneOption.id) {
                    Write-Host " → ✅ movida para Done" -ForegroundColor Green
                    $movedCount++
                }
                else {
                    Write-Host " → ⚠️ falhou" -ForegroundColor Yellow
                }
            }
        }
        else {
            Write-Warning "  Coluna 'Done' não encontrada no projeto"
        }
    }
    else {
        Write-Warning "  Campo de status não encontrado"
    }
}

# ============================================================================
# RESUMO FINAL
# ============================================================================

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
if ($DryRun) {
    Write-Host "✅ [DRY-RUN] Simulação concluída!" -ForegroundColor Yellow
    Write-Host "Execute sem -DryRun para aplicar as mudanças." -ForegroundColor Yellow
}
else {
    Write-Host "✅ Sincronização concluída!" -ForegroundColor Green
    Write-Host "  Issues fechadas: $closedCount / $($completedIssues.Count)" -ForegroundColor Green
    Write-Host "  Issues atualizadas: $($pendingIssues.Count)" -ForegroundColor Cyan
    if ($movedCount) {
        Write-Host "  Cards movidos no kanban: $movedCount" -ForegroundColor Green
    }
}

Write-Host "`n📊 Progresso: 80% (8/10 issues)" -ForegroundColor Magenta
Write-Host "🔗 Project: https://github.com/users/$Owner/projects/$ProjectNumber" -ForegroundColor Cyan
Write-Host "🔗 Issues: https://github.com/$repoOwner/$repoName/issues" -ForegroundColor Cyan
Write-Host ""
