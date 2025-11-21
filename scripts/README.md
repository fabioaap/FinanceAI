# Scripts de Automação

Este diretório contém scripts auxiliares para automação de tarefas do projeto FinanceAI.

## complete-issues.sh

Script para finalizar issues da coluna "In Progress" do GitHub Project #2.

### Pré-requisitos

1. **GitHub CLI (`gh`)** instalado e autenticado:
   ```bash
   # Instalar (macOS)
   brew install gh
   
   # Instalar (Linux)
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update
   sudo apt install gh
   
   # Autenticar
   gh auth login
   ```

2. **Permissões necessárias:**
   - Acesso de escrita no repositório `fabioaap/FinanceAI`
   - Permissão para criar e mergear PRs
   - Permissão para comentar em issues

### Como usar

```bash
# Navegar até o diretório do projeto
cd /path/to/FinanceAI

# Executar o script
./scripts/complete-issues.sh
```

### O que o script faz

1. ✅ Verifica se `gh` CLI está instalado e autenticado
2. ✅ Verifica se já existe PR para a branch `copilot/configure-dexie-schema`
3. ✅ Cria novo PR (se não existir) com:
   - Base: `main`
   - Head: `copilot/configure-dexie-schema`
   - Título e descrição completos
   - Referências para fechar issues #2, #3, #4, #5, #6, #7, #8, #9, #10, #14
4. ⏳ Aguarda GitHub Actions checks (opcional)
5. 🤔 Pergunta se deseja mergear o PR
6. 🔀 Mergeia o PR (se confirmado) com:
   - Estratégia: `--squash` (um único commit no histórico)
   - Delete branch após merge
7. 📝 Adiciona comentário em cada issue resolvida
8. 📋 Exibe instruções para mover issues no Project Board

### Ações manuais necessárias

Após executar o script, você ainda precisa:

1. **Mover issues no Project Board:**
   - Acessar: https://github.com/users/fabioaap/projects/2
   - Arrastar issues #2, #3, #4, #5, #6, #7, #8, #9, #10, #14 de "In Progress" para "Done"

### Alternativas

Se preferir fazer manualmente sem o script:

```bash
# 1. Criar PR
gh pr create --base main --head copilot/configure-dexie-schema \
  --title "feat: implement v0.2 infrastructure" \
  --body "Closes #2, #3, #4, #5, #6, #7, #8, #9, #10, #14"

# 2. Aguardar checks
gh pr checks <PR_NUMBER> --watch

# 3. Mergear PR
gh pr merge <PR_NUMBER> --squash --delete-branch

# 4. Comentar nas issues
for issue in 2 3 4 5 6 7 8 9 10 14; do
  gh issue comment $issue --body "✅ Resolvido no PR #<PR_NUMBER>"
done
```

### Troubleshooting

**Erro: `gh: command not found`**
- Instale o GitHub CLI seguindo as instruções acima

**Erro: `authentication required`**
- Execute: `gh auth login` e siga as instruções

**Erro: `already exists`**
- O PR já foi criado anteriormente, o script irá detectar e usar o existente

**Checks falhando:**
- Verifique os logs no GitHub Actions
- Corrija os erros e faça push na mesma branch
- Re-execute o script

### Notas

- O script usa `--squash` para criar um único commit limpo no histórico
- A branch `copilot/configure-dexie-schema` será deletada após merge
- Issues são fechadas automaticamente pelo GitHub quando o PR é mergeado (devido ao "Closes #X" na descrição)
- A movimentação no Project Board precisa ser manual (limitação da API do GitHub)
