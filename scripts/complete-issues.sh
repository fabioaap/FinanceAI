#!/bin/bash
# Script para finalizar issues da coluna "In Progress" do Project #2
# Requer: gh CLI configurado com autenticação

set -e

REPO="fabioaap/FinanceAI"
PROJECT_NUMBER=2
BRANCH="copilot/configure-dexie-schema"
BASE_BRANCH="main"

# Issues resolvidas neste PR
ISSUES=(2 3 4 5 6 7 8 9 10 14)

echo "🚀 Iniciando processo de finalização das issues..."
echo "Repositório: $REPO"
echo "Branch: $BRANCH"
echo "Issues: ${ISSUES[@]}"
echo ""

# 1. Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ gh CLI não encontrado. Instale com: https://cli.github.com/"
    exit 1
fi

# 2. Verificar autenticação
echo "🔐 Verificando autenticação..."
gh auth status || (echo "❌ gh não está autenticado. Execute: gh auth login" && exit 1)

# 3. Criar PR se não existir
echo ""
echo "📝 Verificando se PR já existe..."
PR_NUMBER=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$PR_NUMBER" ]; then
    echo "📝 Criando novo PR..."
    PR_NUMBER=$(gh pr create \
        --base "$BASE_BRANCH" \
        --head "$BRANCH" \
        --title "feat: implement v0.2 infrastructure - Dexie database, auth service, and sync engine" \
        --body "$(cat <<EOF
Completes 10 issues from "In Progress" column: #2, #3, #4, #5, #6, #7, #8, #9, #10, #14

## Changes
- ✅ Dexie schema with 5 tables (transactions, bills, goals, categories, settings)
- ✅ Repository pattern with CRUD operations
- ✅ Reactive hooks (useTransactions, useCategories, useBills, useGoals, useSettings)
- ✅ Auth service (mock + OAuth placeholders)
- ✅ Sync engine (bidirectional sync base with conflict resolution)
- ✅ App integration (save/display transactions from IndexedDB)

## Validation
- ✅ Lint: 0 errors, 0 warnings
- ✅ Build: Success in 3.06s
- ✅ Bundle: 113KB main + 99KB PDF (lazy)

## Documentation
- docs/db_schema.md
- docs/DELIVERY_SUMMARY.md
- docs/BACKLOG.md (updated)

Closes #2, #3, #4, #5, #6, #7, #8, #9, #10, #14
EOF
)" \
        --json number \
        --jq '.number')
    echo "✅ PR #$PR_NUMBER criado"
else
    echo "✅ PR #$PR_NUMBER já existe"
fi

# 4. Aguardar checks (opcional)
echo ""
echo "⏳ Aguardando GitHub Actions checks..."
gh pr checks "$PR_NUMBER" --watch || echo "⚠️  Alguns checks falharam ou ainda não rodaram"

# 5. Verificar status dos checks antes de mergear
echo ""
echo "🔍 Verificando status dos checks..."
CHECK_STATUS=$(gh pr checks "$PR_NUMBER" --json state --jq '.[].state' | grep -v "SUCCESS" | wc -l)
if [ "$CHECK_STATUS" -gt 0 ]; then
    echo "⚠️  Alguns checks não passaram ou estão pendentes."
    echo "Execute: gh pr checks $PR_NUMBER --watch"
    read -p "🤔 Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "⏸️  Merge cancelado. Aguarde os checks passarem."
        exit 0
    fi
fi

# 6. Perguntar antes de mergear
echo ""
read -p "🤔 Deseja mergear o PR #$PR_NUMBER agora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔀 Mergeando PR #$PR_NUMBER..."
    gh pr merge "$PR_NUMBER" --squash --delete-branch
    echo "✅ PR mergeado com sucesso!"
    
    # Obter hash do merge commit
    MERGE_COMMIT=$(gh pr view "$PR_NUMBER" --json mergeCommit --jq '.mergeCommit.oid' | cut -c1-7)
    
    # 7. Adicionar comentário de fechamento nas issues
    echo ""
    echo "📝 Adicionando comentários nas issues..."
    for ISSUE_NUM in "${ISSUES[@]}"; do
        gh issue comment "$ISSUE_NUM" --body "✅ Resolvido no PR #$PR_NUMBER (commit $MERGE_COMMIT)"
        echo "  ✅ Issue #$ISSUE_NUM comentada"
    done
else
    echo "⏸️  Merge cancelado. Execute manualmente: gh pr merge $PR_NUMBER --squash --delete-branch"
    exit 0
fi

# 8. Instruções para mover no Project Board
echo ""
echo "✅ Processo concluído!"
echo ""
echo "⚠️  ATENÇÃO: Para mover as issues no Project Board #2:"
echo "1. Acesse: https://github.com/users/fabioaap/projects/2"
echo "2. Mova as seguintes issues de 'In Progress' para 'Done':"
for ISSUE_NUM in "${ISSUES[@]}"; do
    echo "   - Issue #$ISSUE_NUM"
done
echo ""
echo "Ou use a API do GitHub Projects v2 (mais complexo):"
echo "https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects"
