# BACKLOG - FinanceAI (Upload de Arquivos Bancários)

Este backlog mantém o time alinhado sobre o que já foi entregue, o que está em andamento e o que ainda precisa ser priorizado.

---

## ✅ Done
- [Issue #33] Integrar `ImportBankFileModal` ao `App.tsx` (botão no header, estado `showImportFile`, `handleImportComplete` persistindo no Dexie)
- [Issue #34] Criar testes unitários completos para `bank-file-parser` (Vitest + fixtures)
- [Issue #35] Criar testes E2E Playwright para o fluxo de upload/importação
- [Issue #36] Detectar e prevenir transações duplicadas (`duplicate-detector.ts` + integração no modal)
- [Issue #37] Adicionar suporte QIF ao parser
- [Issue #38] Implementar mapeamento de categorias customizável + modal dedicado
- [Issue #39] Permitir upload de múltiplos arquivos simultaneamente com barras de progresso
- [Issue #42] Pipeline CI (lint, build, testes e cobertura) em GitHub Actions
- Atualizações complementares: exemplos em `docs/examples`, documentação completa em `docs/*`, e componentes UI ajustados

---

## 🔄 In Progress
1. **Issue #53 – Remover Spark Framework e consolidar Dexie/localStorage**
   - Deliverables:
     - Remover dependências do Spark do build (feito)
     - Usar `useAppTransactions` (Dexie) para transações (feito)
     - Implementar adapters temporários para bills/goals/idioma (feito)
     - **Pendente:** criar tabelas Dexie definitivas (`bills`, `goals`, `settings`) e hooks (`useBills`, `useGoals`, `useAppLanguage`)
     - **Pendente:** migrar dados legados do localStorage/Spark e escrever testes dos novos hooks
   - Critério de aceite: nenhum componente usa `useKV`/Spark, todos os dados persistem em Dexie e testes cobrem os novos fluxos
   - Responsável: @fabioaap
   - Estimativa restante: 1-2 dias

---

## 📝 To Do (Prioridade Alta)
1. **Script de migração localStorage → Dexie**
   - Ler dados existentes (`transactions-YYYY-MM`, `bills`, `goals`, `app-language`), converter e gravar nas novas tabelas
   - Rodar automaticamente na inicialização do app com flag idempotente
   - Critério de aceite: usuários não perdem dados ao atualizar
   - Estimativa: 1 dia

---

## 🧭 To Do (Prioridade Média)
1. **Issue #40 – Otimizar parser para arquivos grandes (>10k linhas)**
   - Implementar Web Worker + parsing em streaming/chunks
   - Benchmarkar desempenho e expor progresso na UI
   - Critério de aceite: upload não bloqueia UI e termina < 5s para 10k linhas em laptops médios
   - Estimativa: 2-3 dias

2. **Issue #41 – Integração com Sync Engine / nuvem**
   - Definir arquitetura de sincronização, conflict resolution e criptografia
   - Integrar com backend quando disponível
   - Critério de aceite: sincronização confiável com rollback documentado
   - Estimativa: depende da disponibilidade de infra

---

## ⚙️ To Do (Prioridade Baixa / Futuro)
- Observabilidade/telemetria do parser e do repositório Dexie (logs estruturados + métricas de performance)
- Estratégia de backup/export (CSV/JSON) para facilitar suporte enquanto o sync não chega

---

## 📌 Observações
- `App.tsx` já não referencia Spark; adapters atuais () são temporários até Dexie completo
- Scripts em `scripts/*.ps1` automatizam criação de issues e atualização do GitHub Project #2

---

## 📈 Sugestões rápidas
- Criar `docs/TEMPLATES/migration.md` para registrar planos de migração (Spark → Dexie, futuro Dexie → Sync)
- Mapear datasets reais (anonimizados) para melhorar regras de categorização e testes de performance

---

## 🤖 Automação de Issues

Scripts disponíveis:
- `scripts/issues.json` – backlog estruturado
- `scripts/create_issues_api.ps1` – cria issues/labels e adiciona ao Project #2
- `scripts/README.md` – instruções completas

Execução recomendada:
```pwsh
cd C:\Users\Educacross\Documents\FinanceAI
pwsh .\scripts\create_issues_api.ps1 -ProjectNumber 2 -Owner fabioaap -CreateLabels
```

---