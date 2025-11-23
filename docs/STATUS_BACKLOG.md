# Status de Implementacao - Backlog FinanceAI

**Data de atualizacao:** 23 de novembro de 2025  
**Progresso geral:** 82% concluido (9/11 issues) | **Issue #53:** Concluida e em revisao final

**GitHub Project:** https://github.com/users/fabioaap/projects/2  
**Pull Request #53:** https://github.com/fabioaap/FinanceAI/pull/53  
**Issues do Repositorio:** https://github.com/fabioaap/FinanceAI/issues

**Resumo rapido:**
- PR #53 entrega a remocao completa do Spark, migracao para Dexie/localStorage e documentacao completa
- Todos os fluxos principais (transacoes, bills, goals, idioma) estao persistidos localmente e testados
- Issue #40 (Web Worker do parser) esta em execucao; Issue #41 (cloud sync) segue em discovery

---

## Issues concluidas (9/11)

### Issue #53: Remover Spark Framework e migrar para Dexie
Status: Concluido (aguardando merge)  
Branch: `copilot/remove-spark-and-migrate-to-dexie`  
Commits: 13  
Principais entregas:
- Hooks definitivos: `useAppTransactions`, `useBillsAdapter`, `useGoalsAdapter`, persistencia do idioma
- Remocao total do Spark (useKV, plugins Vite, deps) e reducao de 29 dependencias
- Documentacao: `docs/MIGRATION_SPARK_TO_DEXIE.md`, `docs/BREAKING_CHANGES.md`, `docs/MIGRATION_SUMMARY.md`
- Testes: TransactionRepository 7/7, CategoryRepository 3/3, parser com mesmas falhas pre-existentes (8/28)
- Proximo passo: code review + testes manuais via navegador antes do merge

### Issue #33: Integrar ImportBankFileModal no App
Status: Concluido  
Highlights: botao Importar Extrato com icone Upload, estado `showImportFile`, funcao `handleImportComplete` persistindo em Dexie/useKV e toast de sucesso. Arquivos: `src/App.tsx`, `src/components/modals/ImportBankFileModal.tsx`.

### Issue #34: Testes unitarios para bank-file-parser
Status: Concluido  
Highlights: Vitest configurado, 28 testes cobrindo CSV/OFX/TXT/QIF, datas/valores/categorias e scripts `test`, `test:ui`, `test:coverage`.

### Issue #35: Testes E2E para fluxo de upload/importacao
Status: Concluido  
Highlights: Playwright configurado (`playwright.config.ts`), suite `e2e/import-flow.spec.ts`, script `npm run test:e2e`.

### Issue #36: Detectar e prevenir transacoes duplicadas
Status: Concluido  
Highlights: modulo `src/lib/duplicate-detector.ts` com hash date+amount+description, funcoes `findDuplicates` e `removeDuplicateTransactions` integradas ao modal.

### Issue #37: Suporte a QIF no parser
Status: Concluido  
Highlights: suporte completo ao formato QIF no `BankFileParser`, cobrindo datas, valores e separadores especificos.

### Issue #38: Mapeamento de categorias customizavel
Status: Concluido  
Highlights: modal de mapeamento, persistencia em localStorage, sugestoes automticas no parser com prioridade por regra.

### Issue #39: Upload de multiplos arquivos
Status: Concluido  
Highlights: componente `BankFileUpload` suportando drag & drop multiplo, validacao e preview consolidado.

### Issue #42: Pipeline CI (lint, build, tests, coverage)
Status: Concluido  
Highlights: Workflow GitHub Actions cobrindo lint, build Vite, Vitest, Playwright e envio para Codecov.

---

## Em execucao / Discovery

### Issue #40: Web Worker para parser acima de 10k linhas
Status: Em execucao (estimativa 2-3 dias)  
Escopo: mover parse para `src/lib/bank-file-parser-worker.ts`, implementar comunicacao com progress updates, fallback para main thread e teste com arquivo 50k linhas. Branch esperada `copilot/add-web-worker-for-parser`.

### Issue #41: Cloud sync e conflict resolution
Status: Discovery  
Escopo: definir arquitetura de sincronizacao Dexie <> backend (NestJS + PostgreSQL), estrategia de conflitos (Last Write Wins ou CRDT) e fila offline-first. Bloqueadores: especificar API, provisionar backend, definir versionamento.

---

## Checklist final Issue #53 (antes do merge)
- [ ] Code review da PR #53 (13 commits)
- [ ] Testes manuais em browser: CRUD de bills/goals, troca de idioma, verificacao Dexie/localStorage
- [ ] `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e` apos rebase final
- [ ] Validar IndexedDB em DevTools (Application -> IndexedDB -> FinanceAI)
- [ ] Comunicar breaking changes (IDs numericos, dependencias removidas)
- [ ] Merge para `main` e monitoramento
