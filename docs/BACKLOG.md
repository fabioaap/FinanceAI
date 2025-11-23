# BACKLOG - FinanceAI

Status atualizado: 22/11/2025 | Plano de ação estruturado para Issue #53 em execução

---

## ✅ Done (8/11)

- [Issue #33] Integrar ImportBankFileModal ao App.tsx
- [Issue #34] Testes unitários para bank-file-parser (28 testes, 100% coverage)
- [Issue #35] Testes E2E Playwright para fluxo de importação
- [Issue #36] Detectar e prevenir transações duplicadas
- [Issue #37] Suporte QIF no parser
- [Issue #38] Mapeamento de categorias customizável
- [Issue #39] Upload de múltiplos arquivos simultâneos
- [Issue #42] Pipeline CI (lint, build, tests, coverage)

---

## 🔄 In Progress (1/11)

### Issue #53 – Remover Spark Framework e consolidar Dexie

**Plano estruturado (1-2 dias):**

1. **Expandir schema Dexie**
   - Arquivo: `src/database/db.ts`, `src/lib/types.ts`
   - Adicionar tabelas: `bills`, `goals`, `settings`
   - Índices apropriados para queries eficientes

2. **Criar hooks definitivos**
   - `src/hooks/useBills.ts` – CRUD completo, ordenação by dueDate
   - `src/hooks/useGoals.ts` – CRUD + atualização progresso
   - `src/hooks/useAppLanguage.ts` – gerenciar settings (key `app-language`)
   - Cada hook: loading/error states, useEffect, useCallback, error handling
   - Testes Vitest para cada hook

3. **Atualizar App.tsx**
   - Remover `useBillsAdapter`, `useGoalsAdapter`
   - Importar e usar novos hooks `useBills`, `useGoals`, `useAppLanguage`
   - Handlers async/await com toasts para sucesso/erro

4. **Script de migração**
   - Arquivo: `src/lib/migrate-local-storage.ts`
   - Ler chaves antigas: `transactions-YYYY-MM`, `bills`, `goals`, `app-language`
   - Converter para formatos Dexie e gravar em `db.*`
   - Remover dados antigos após sucesso
   - Flag `sessionStorage` (`spark-migration-done`) para idempotência
   - Integrar em `App.tsx` via `useEffect` global

5. **Testes**
   - `npm run lint` → zero erros
   - `npm run build` → sucesso
   - `npm test` → unit tests dos novos hooks
   - `npm run test:e2e` → fluxos E2E
   - Verificar IndexedDB manual (DevTools: Application → IndexedDB → FinanceAI)

6. **Documentação**
   - `docs/MIGRATION_SPARK_TO_DEXIE.md` – detalhes completos + testes
   - `docs/BREAKING_CHANGES.md` – APIs novas (hooks Dexie, IDs numéricos, async)
   - `docs/STATUS_BACKLOG.md`, `docs/BACKLOG.md` – atualizar com conclusão e métricas

7. **Git**
   - Commits lógicos com mensagens claras
   - Branch: `copilot/remove-spark-and-migrate-to-dexie`
   - PR #53 atualizada e pronta para merge

---

## 📝 To Do (Próximas prioridades)

### Script de migração (fallback/helper)
- Arquivo: `src/scripts/migrate-spark-data.ts` (alternativo)
- Exportar função reutilizável para suporte manual se necessário
- Documentar em `docs/MIGRATION_GUIDE.md`

### Issue #40 – Otimizar parser para arquivos grandes
- **Status:** ⏳ Planejamento
- **Scope:** Web Worker + streaming para >10k linhas
- **Estimativa:** 2-3 dias após Issue #53

### Issue #41 – Sync Engine / nuvem
- **Status:** ⏳ Discovery
- **Scope:** Arquitetura de sincronização + conflict resolution
- **Estimativa:** TBD (depende de infra)

---

## 🎯 Critérios de sucesso Issue #53

- ✅ Nenhuma referência ao Spark/useKV em `src/`
- ✅ Bills/goals/idioma 100% em Dexie
- ✅ Script migração automático
- ✅ Testes: lint, build, test, test:e2e → todos green
- ✅ Documentação atualizada
- ✅ PR #53 → merge

---

## 📌 Notas

- **Adapters temporários** (useBillsAdapter, useGoalsAdapter) serão removidos após Dexie estar pronto
- **Fake IndexedDB** já configurado em `test/setup.ts`
- **Mock/testing:** usar fake-indexeddb para unit tests
- **Performance:** não é bloqueador agora; Issue #40 cobrirá optimizações

---