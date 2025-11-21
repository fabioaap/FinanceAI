# 🚀 Scripts para Criar Issues e Popular Project #2

Este diretório contém scripts para automatizar a criação de issues do backlog e adicioná-las ao GitHub Project #2.

---

## 📋 Arquivos

### Scripts de Criação
- **`issues.json`** - Lista estruturada de issues do backlog (título, descrição, labels, assignees, estimativa)
- **`create_issues_api.ps1`** - Script PowerShell que usa GitHub REST API para criar issues e adicioná-las ao Project (não requer `gh` CLI)
- **`create_issues_and_add_to_project.ps1`** - Script alternativo que usa `gh` CLI (requer instalação do GitHub CLI)

### Scripts de Atualização ✨
- **`update_issues_status.ps1`** - Fecha issues concluídas e atualiza labels baseado em `STATUS_BACKLOG.md`
- **`update_project_kanban.ps1`** - Move cards no kanban (Done/To Do) baseado no status atual
- **`sync_github_status.ps1`** - **🚀 COMPLETO**: Faz tudo de uma vez (fecha issues + atualiza labels + move no kanban)

---

## ⚡ Execução Rápida (Recomendado)

### Pré-requisitos
1. **GitHub Personal Access Token** com permissões:
   - `repo` (acesso completo a repositórios)
   - `project` (acesso a projects)

   Crie seu token aqui: https://github.com/settings/tokens/new

2. **PowerShell** (já disponível no Windows)

### Passo a passo

1. **Abra PowerShell no diretório raiz do projeto:**
```pwsh
cd C:\Users\Educacross\Documents\FinanceAI
```

2. **Execute o script:**
```pwsh
pwsh .\scripts\create_issues_api.ps1 -ProjectNumber 2 -Owner fabioaap -CreateLabels
```

3. **Cole seu GitHub token quando solicitado** (ou defina antes via variável de ambiente):
```pwsh
$env:GITHUB_TOKEN = "ghp_seu_token_aqui"
pwsh .\scripts\create_issues_api.ps1 -ProjectNumber 2 -Owner fabioaap -CreateLabels
```

---

## 🎯 O que o script faz

1. ✅ Lê `issues.json` com as 10 issues do backlog
2. ✅ Cria labels no repositório (todo, in-progress, tests, feature, etc.) se `-CreateLabels` estiver ativo
3. ✅ Cria cada issue no repositório `fabioaap/FinanceAI`
4. ✅ Adiciona automaticamente cada issue ao Project #2 (user-level) usando GraphQL API
5. ✅ Exibe links e resumo ao final

---

## 📊 Issues que serão criadas

As issues correspondem aos itens do `docs/BACKLOG.md`:

1. **Integrar ImportBankFileModal no App** (in-progress, 1h)
2. **Adicionar testes unitários para bank-file-parser** (todo, 2-3h)
3. **Criar testes E2E para upload/importação** (todo, 3-4h)
4. **Detectar e prevenir transações duplicadas** (todo, 3h)
5. **Adicionar suporte a QIF no parser** (todo, 2-3h)
6. **Mapeamento de categorias customizável** (todo, 4-5h)
7. **Permitir múltiplos arquivos simultâneos** (todo, 4h)
8. **Otimizar parser para arquivos grandes** (future, 2-3d)
9. **Integração com Sync Engine / nuvem** (future, TBD)
10. **Adicionar CI (lint, build, testes)** (todo, 4h)

---

## 🔧 Opções do script

- **`-ProjectNumber <number>`** - Número do Project (padrão: 2)
- **`-Owner <username>`** - Owner do Project user-level (padrão: fabioaap)
- **`-CreateLabels`** - Cria labels no repositório antes de criar issues
- **`-DryRun`** - Simula a execução sem criar issues (útil para testar)

### Exemplo de dry-run (simulação):
```pwsh
pwsh .\scripts\create_issues_api.ps1 -ProjectNumber 2 -Owner fabioaap -CreateLabels -DryRun
```

---

## 🛠️ Alternativa com GitHub CLI

Se você tiver o `gh` CLI instalado e autenticado, pode usar o script alternativo:

```pwsh
pwsh .\scripts\create_issues_and_add_to_project.ps1 -ProjectNumber 2 -Owner fabioaap -CreateLabels
```

Instalar GitHub CLI: https://cli.github.com/

---

## 🔄 Sincronizar GitHub com STATUS_BACKLOG.md

### Opção 1: Script Completo (Recomendado) 🚀

Faz **tudo de uma vez**: fecha issues + atualiza labels + move cards no kanban

```pwsh
# Simulação (dry-run) - recomendado testar primeiro
pwsh .\scripts\sync_github_status.ps1 -ProjectNumber 2 -Owner fabioaap -DryRun

# Execução real
pwsh .\scripts\sync_github_status.ps1 -ProjectNumber 2 -Owner fabioaap
```

**O que faz:**
- ✅ Fecha as 8 issues concluídas (#33-#39, #42) com comentário
- 🏷️ Atualiza labels das issues pendentes (#40, #41)
- 📋 Move cards no kanban do Project para "Done"
- 📊 Mantém GitHub 100% sincronizado com STATUS_BACKLOG.md

---

### Opção 2: Scripts Individuais

Se preferir controle granular:

**A) Apenas fechar issues e atualizar labels:**
```pwsh
pwsh .\scripts\update_issues_status.ps1 -DryRun
```

**B) Apenas mover cards no kanban:**
```pwsh
pwsh .\scripts\update_project_kanban.ps1 -ProjectNumber 2 -Owner fabioaap -DryRun
```

---

## ❓ Troubleshooting

### Erro: "Não foi possível obter ID do Project"
- Verifique se o Project #2 existe em https://github.com/users/fabioaap/projects/2
- Certifique-se de que o token tem permissão `project`
- Confirme que você está logado com a conta correta (fabioaap)

### Erro: "401 Unauthorized"
- Token inválido ou expirado — gere um novo em https://github.com/settings/tokens/new
- Certifique-se de que as permissões `repo` e `project` estão marcadas

### Erro: "Issue já existe no project"
- Normal se você já executou o script antes
- O script tenta adicionar mas não falha se a issue já estiver no project

---

## 🎉 Próximos Passos

Após criar as issues:

1. **Organize no Project Board:**
   - Mova issues para colunas (To do / In Progress / Done)
   - Ajuste prioridades e milestones

2. **Crie um Milestone v0.2:**
```pwsh
# (requer gh CLI)
gh milestone create "v0.2" --description "Objetivos para v0.2" --due-date "2025-12-31"
```

3. **Atribua issues ao milestone:**
   - Via UI do GitHub ou comandos `gh`

4. **Configure CI/CD:**
   - Implemente a issue #10 (pipeline de CI)

---

## 📚 Documentação Relacionada

- `docs/BACKLOG.md` - Backlog completo do projeto
- `docs/ISSUES_PLAN.md` - Plano de issues e organização
- `docs/ISSUES_CREATED.md` - Resumo de issues criadas

---

**Desenvolvido para FinanceAI - DevOps Automation** 🚀
