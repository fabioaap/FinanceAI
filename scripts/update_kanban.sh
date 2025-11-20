#!/bin/bash

# Script para atualizar GitHub Project #2 Kanban
# USO: export GITHUB_TOKEN="seu_token" && bash scripts/update_kanban.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  FINANCEAI - Atualização do GitHub Project #2 Kanban        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se o token está definido
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Erro: Variável GITHUB_TOKEN não definida"
    echo ""
    echo "Como usar:"
    echo "  export GITHUB_TOKEN=\"seu_token_aqui\""
    echo "  bash scripts/update_kanban.sh"
    echo ""
    echo "Ou em uma linha:"
    echo "  GITHUB_TOKEN=\"seu_token\" bash scripts/update_kanban.sh"
    echo ""
    exit 1
fi

# Verificar se gh CLI está disponível
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: GitHub CLI (gh) não está instalado"
    echo ""
    echo "Instale com:"
    echo "  - macOS: brew install gh"
    echo "  - Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  - Windows: winget install --id GitHub.cli"
    echo ""
    exit 1
fi

echo "✓ GitHub CLI detectado: $(gh --version | head -1)"
echo ""

# Autenticar
echo "🔐 Autenticando com GitHub..."
if echo "$GITHUB_TOKEN" | gh auth login --with-token 2>&1 | grep -q "Logged in"; then
    echo "✓ Autenticado com sucesso"
else
    echo "❌ Erro: Falha na autenticação"
    echo ""
    echo "Verifique se o token é válido e tem as permissões necessárias:"
    echo "  - repo (Full control of repositories)"
    echo "  - project (Full control of projects)"
    echo ""
    echo "Gere um novo token em: https://github.com/settings/tokens/new"
    exit 1
fi
echo ""

# Issues para marcar como "Done"
COMPLETED_ISSUES=(33 34 35 36 37 38 39 42)
REPO="fabioaap/FinanceAI"

# Listar issues
echo "📋 Issues para marcar como concluídas:"
for issue in "${COMPLETED_ISSUES[@]}"; do
    echo "   • Issue #$issue"
done
echo ""

# Confirmar ação
read -p "Deseja continuar? (s/n): " confirm
if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo "❌ Operação cancelada pelo usuário"
    exit 0
fi
echo ""

# Processar cada issue
echo "🚀 Fechando issues e adicionando comentários..."
success_count=0
failed_count=0

for issue in "${COMPLETED_ISSUES[@]}"; do
    echo -n "  Processando Issue #$issue... "
    
    # Tentar fechar a issue
    if gh issue close "$issue" --repo "$REPO" \
        --comment "✅ Implementação concluída - 80% do backlog finalizado (atualização automática via script)" \
        &>/dev/null; then
        echo "✅ Fechada"
        ((success_count++))
    else
        # Verificar se já está fechada
        if gh issue view "$issue" --repo "$REPO" --json state -q .state 2>/dev/null | grep -q "CLOSED"; then
            echo "ℹ️  Já estava fechada"
            ((success_count++))
        else
            echo "❌ Erro"
            ((failed_count++))
        fi
    fi
    
    sleep 0.5
done

# Resultado final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Atualização concluída!"
echo ""
echo "📊 Resultados:"
echo "   ✅ $success_count/${#COMPLETED_ISSUES[@]} issues processadas com sucesso"
if [ $failed_count -gt 0 ]; then
    echo "   ❌ $failed_count issues com erro"
fi
echo "   📝 2 issues permanecem abertas (#40, #41) - Futuro"
echo ""
echo "🔗 Verifique o projeto em:"
echo "   https://github.com/users/fabioaap/projects/2"
echo ""
echo "💡 Nota: As issues foram fechadas. Se o GitHub Project #2 não"
echo "   sincronizar automaticamente, arraste-as manualmente para 'Done'."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
