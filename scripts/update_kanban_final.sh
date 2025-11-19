#!/bin/bash

# Script Definitivo para Atualizar GitHub Project #2 Kanban
# Token fornecido: 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
# 
# IMPORTANTE: Execute este script em sua máquina local, não no CI/CD
# O ambiente CI/CD bloqueia acesso à API do GitHub por políticas de rede

set -e

GITHUB_TOKEN="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"
REPO="fabioaap/FinanceAI"
COMPLETED_ISSUES=(33 34 35 36 37 38 39 42)

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  FINANCEAI - Atualização Definitiva do Kanban               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ Erro: GitHub CLI (gh) não está instalado"
    echo ""
    echo "Instale com:"
    echo "  • macOS:   brew install gh"
    echo "  • Windows: winget install --id GitHub.cli"
    echo "  • Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo ""
    exit 1
fi

echo "✓ GitHub CLI detectado: $(gh --version | head -1)"
echo ""

# Autenticar com o token
echo "🔐 Autenticando com GitHub..."
if echo "$GITHUB_TOKEN" | gh auth login --with-token 2>&1; then
    echo "✓ Autenticado com sucesso"
else
    echo "❌ Erro na autenticação"
    echo ""
    echo "Possíveis causas:"
    echo "  1. Token expirado"
    echo "  2. Permissões insuficientes (precisa: repo + project)"
    echo "  3. Token revogado"
    echo ""
    echo "Gere um novo token em: https://github.com/settings/tokens/new"
    exit 1
fi
echo ""

# Verificar status de autenticação
echo "📋 Verificando autenticação..."
gh auth status
echo ""

# Listar issues para processar
echo "📝 Issues que serão fechadas:"
for issue in "${COMPLETED_ISSUES[@]}"; do
    echo "   • Issue #$issue"
done
echo ""

read -p "Deseja continuar? (s/n): " confirm
if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo "❌ Operação cancelada"
    exit 0
fi
echo ""

# Processar cada issue
echo "🚀 Fechando issues..."
success=0
failed=0

for issue in "${COMPLETED_ISSUES[@]}"; do
    echo -n "  Issue #$issue: "
    
    # Verificar se a issue existe e seu status atual
    current_state=$(gh issue view "$issue" --repo "$REPO" --json state -q .state 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$current_state" = "NOT_FOUND" ]; then
        echo "❌ Não encontrada"
        ((failed++))
        continue
    fi
    
    if [ "$current_state" = "CLOSED" ]; then
        echo "ℹ️  Já fechada"
        ((success++))
        continue
    fi
    
    # Fechar a issue
    if gh issue close "$issue" --repo "$REPO" \
        --comment "✅ **Implementação concluída** - 80% do backlog finalizado

Esta issue foi marcada como concluída automaticamente.

**Commit de atualização:** 9281d3d
**Data:** 19 de novembro de 2025

Veja documentação completa em:
- \`docs/BACKLOG.md\`
- \`docs/STATUS_BACKLOG.md\`" 2>&1; then
        echo "✅ Fechada"
        ((success++))
    else
        echo "❌ Erro ao fechar"
        ((failed++))
    fi
    
    sleep 1
done

# Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Processamento concluído!"
echo ""
echo "📊 Resultados:"
echo "   ✅ $success/${#COMPLETED_ISSUES[@]} issues processadas com sucesso"
if [ $failed -gt 0 ]; then
    echo "   ❌ $failed issues com erro"
fi
echo ""
echo "📈 Progresso do backlog:"
echo "   ✅ Concluído: 8/10 issues (80%)"
echo "   📝 Pendente:  2/10 issues (20%) - #40, #41"
echo ""
echo "🔗 Próximos passos:"
echo "   1. Verifique o projeto: https://github.com/users/fabioaap/projects/2"
echo "   2. Se necessário, arraste manualmente as issues para 'Done'"
echo "   3. Considere criar release v0.2.0 com as funcionalidades"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
