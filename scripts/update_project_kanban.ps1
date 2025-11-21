<#
    Script para atualizar kanban do GitHub Project baseado no STATUS_BACKLOG.md
    Move issues concluídas para coluna "Done" e pendentes para "To Do"/"Backlog"
    
    Uso:
    $env:GITHUB_TOKEN="ghp_..."
    pwsh ./scripts/update_project_kanban.ps1 -ProjectNumber 2 -Owner fabioaap [-DryRun]
#>

param(
    [int]$ProjectNumber = 2,
    [string]$Owner = "fabioaap",
    [switch]$DryRun
)

$repoOwner = "fabioaap"
$repoName = "FinanceAI"

# Issues concluídas (mover para Done)
$completedIssues = @(33, 34, 35, 36, 37, 38, 39, 42)

# Issues pendentes/futuro (mover para Backlog/To Do)
$pendingIssues = @(40, 41)

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
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

Write-Host "`n📋 Atualizando kanban do Project #$ProjectNumber..." -ForegroundColor Cyan
Write-Host "Owner: $Owner | Repo: $repoOwner/$repoName`n" -ForegroundColor Gray

# Função para fazer query GraphQL
function Invoke-GraphQL([string]$query) {
    $body = @{ query = $query } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/graphql" `
            -Headers $headers -Method Post -Body $body
        
        if ($response.errors) {
            Write-Host "  ❌ GraphQL Error: $($response.errors[0].message)" -ForegroundColor Red
            return $null
        }
        
        return $response.data
    }
    catch {
        Write-Host "  ❌ Request Error: $_" -ForegroundColor Red
        return $null
    }
}

# 1. Obter Project ID
Write-Host "🔍 Buscando Project ID..." -ForegroundColor Cyan
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
    Write-Error "Não foi possível obter dados do Project #$ProjectNumber"
    exit 1
}

$projectId = $projectData.user.projectV2.id
$projectTitle = $projectData.user.projectV2.title
Write-Host "  ✅ Project encontrado: $projectTitle (ID: $projectId)" -ForegroundColor Green

# 2. Encontrar campo "Status" e opções "Done", "To Do", "Backlog"
$statusField = $projectData.user.projectV2.fields.nodes | Where-Object { $_.name -eq "Status" }
if (-not $statusField) {
    Write-Warning "Campo 'Status' não encontrado. Tentando outros nomes comuns..."
    $statusField = $projectData.user.projectV2.fields.nodes | Where-Object { 
        $_.name -in @("Status", "Estado", "State", "Column") 
    } | Select-Object -First 1
}

if (-not $statusField) {
    Write-Error "Não foi possível encontrar campo de status no projeto"
    exit 1
}

Write-Host "  ✅ Campo de status: '$($statusField.name)'" -ForegroundColor Green

$doneOption = $statusField.options | Where-Object { $_.name -in @("Done", "✅ Done", "Concluído", "Finished") } | Select-Object -First 1
$todoOption = $statusField.options | Where-Object { $_.name -in @("To Do", "Todo", "📝 To Do", "Backlog", "Pending") } | Select-Object -First 1

if (-not $doneOption) {
    Write-Warning "Opção 'Done' não encontrada. Opções disponíveis:"
    $statusField.options | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor Gray }
    Write-Error "Por favor, ajuste o script com o nome correto da coluna 'Done'"
    exit 1
}

Write-Host "  ✅ Coluna 'Done': $($doneOption.name) (ID: $($doneOption.id))" -ForegroundColor Green
if ($todoOption) {
    Write-Host "  ✅ Coluna 'To Do': $($todoOption.name) (ID: $($todoOption.id))" -ForegroundColor Green
}

# 3. Função para obter item do projeto pela issue
function Get-ProjectItemId([int]$issueNumber) {
    $itemQuery = @"
{
  repository(owner: \"$repoOwner\", name: \"$repoName\") {
    issue(number: $issueNumber) {
      projectItems(first: 10) {
        nodes {
          id
          project {
            id
          }
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

# 4. Função para mover item
function Move-ProjectItem([string]$itemId, [string]$statusOptionId, [string]$statusName) {
    if ($DryRun) {
        Write-Host "    [dry-run] Moveria para '$statusName'" -ForegroundColor Yellow
        return $true
    }
    
    $mutation = @"
mutation {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: \"$projectId\"
      itemId: \"$itemId\"
      fieldId: \"$($statusField.id)\"
      value: { 
        singleSelectOptionId: \"$statusOptionId\"
      }
    }
  ) {
    projectV2Item {
      id
    }
  }
}
"@
    
    $result = Invoke-GraphQL -query $mutation
    return ($null -ne $result)
}

# 5. Processar issues concluídas
Write-Host "`n✅ Movendo issues concluídas para 'Done':" -ForegroundColor Green
$movedCount = 0
foreach ($issueNum in $completedIssues) {
    Write-Host "  Issue #$issueNum" -NoNewline
    
    $itemId = Get-ProjectItemId -issueNumber $issueNum
    if (-not $itemId) {
        Write-Host " - ⚠️  Não encontrada no projeto" -ForegroundColor Yellow
        continue
    }
    
    if (Move-ProjectItem -itemId $itemId -statusOptionId $doneOption.id -statusName $doneOption.name) {
        Write-Host " - ✅ Movida para '$($doneOption.name)'" -ForegroundColor Green
        $movedCount++
    }
    else {
        Write-Host " - ❌ Falhou" -ForegroundColor Red
    }
}

# 6. Processar issues pendentes
if ($todoOption) {
    Write-Host "`n⏳ Movendo issues pendentes para '$($todoOption.name)':" -ForegroundColor Cyan
    foreach ($issueNum in $pendingIssues) {
        Write-Host "  Issue #$issueNum" -NoNewline
        
        $itemId = Get-ProjectItemId -issueNumber $issueNum
        if (-not $itemId) {
            Write-Host " - ⚠️  Não encontrada no projeto" -ForegroundColor Yellow
            continue
        }
        
        if (Move-ProjectItem -itemId $itemId -statusOptionId $todoOption.id -statusName $todoOption.name) {
            Write-Host " - ✅ Movida para '$($todoOption.name)'" -ForegroundColor Green
        }
        else {
            Write-Host " - ❌ Falhou" -ForegroundColor Red
        }
    }
}

# Resumo final
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
if ($DryRun) {
    Write-Host "✅ [DRY-RUN] Simulação concluída!" -ForegroundColor Yellow
    Write-Host "Execute sem -DryRun para mover os cards no kanban." -ForegroundColor Yellow
}
else {
    Write-Host "✅ Kanban atualizado!" -ForegroundColor Green
    Write-Host "Issues movidas para 'Done': $movedCount / $($completedIssues.Count)" -ForegroundColor Green
}

Write-Host "`n📊 Progresso: 80% (8/10 issues concluídas)" -ForegroundColor Magenta
Write-Host "🔗 Visualizar kanban: https://github.com/users/$Owner/projects/$ProjectNumber" -ForegroundColor Cyan
Write-Host ""
