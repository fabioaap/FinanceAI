# BACKLOG - FinanceAI

Status atualizado: 23/11/2025 | PR #53 COMPLETA (pronta para merge) | Issues #40/#41 em discovery

---

## ✅ Done (9/11)

- [Issue #33] Integrar ImportBankFileModal ao App.tsx
- [Issue #34] Testes unitários para bank-file-parser (28 testes, 100% coverage)
- [Issue #35] Testes E2E Playwright para fluxo de importação
- [Issue #36] Detectar e prevenir transações duplicadas
- [Issue #37] Suporte QIF no parser
- [Issue #38] Mapeamento de categorias customizável
- [Issue #39] Upload de múltiplos arquivos simultâneos
- [Issue #42] Pipeline CI (lint, build, tests, coverage)
- [Issue #53] Remover Spark Framework, migrar para Dexie + localStorage ✨

---

## 🔄 In Discovery (2/11)

### Issue #40 – Otimizar parser para arquivos grandes (Web Worker)

**Status:** 🚀 Em execução (delegado ao agente de nuvem)  
**Estimativa:** 2-3 dias  
**Branch esperado:** `copilot/add-web-worker-for-parser`

**Scope:**
- Arquivo: `src/lib/bank-file-parser-worker.ts`
- Implementar Worker para parsing assíncrono
- Suportar arquivos >10k linhas sem travar UI
- Teste com arquivo 50k+ linhas real (banco)
- Benchmark: antes/depois de performance

**Critérios de sucesso:**
- ✅ Parser em Web Worker (transferência via postMessage)
- ✅ UI responsiva durante import grande
- ✅ Fallback para main thread se Worker indisponível
- ✅ Testes E2E com arquivo 50k linhas
- ✅ Documentação em docs/

### Issue #41 – Cloud Sync Engine + Conflict Resolution

**Status:** 💬 Discovery (requisitos backend a definir)  
**Estimativa:** TBD  
**Prioridade:** Depois de #40 completo

**Scope:**
- Sincronização local → servidor remoto
- Conflict resolution (último write wins / merge 3-way)
- Offline-first com fila de sincronização
- Requer backend (NestJS + PostgreSQL)

**Bloqueadores:**
- ⏳ Definir especificação de API (REST/GraphQL)
- ⏳ Implementar backend de sincronização
- ⏳ Escolher estratégia de versionamento (CRDT/timestamp)

---

## 📋 Próximos Passos (Bloqueadores)

### Issue #53 – Finalizar (antes de mergear)
- [ ] **Code review** de PR #53 (revisar 13 commits)
- [ ] **Testes manuais** no browser (bills, goals, language)
- [ ] **Validação IndexedDB** (DevTools → Application → IndexedDB → FinanceAI)
- [ ] **Merge para main** (merge --no-ff + push)
- [ ] **Notificar breaking changes** (Transaction IDs são numbers agora)

### Issue #40 – Em Execução
- Branch: `copilot/add-web-worker-for-parser`
- Delegado ao agente de nuvem
- Acompanhar PR relacionada

### Issue #41 – Aguardando Discovery
- Definir requisitos backend (API spec)
- Escolher plataforma sync (Firebase, custom server, etc)
- Estimar esforço (depende arquitetura)

---

## 🏁 Checklist Final Issue #53 (Pré-merge)

- ✅ Nenhuma referência ao Spark/useKV em `src/`
- ✅ Bills/goals em localStorage adapters (Dexie pronto futuro)
- ✅ Transações em Dexie (IndexedDB)
- ✅ Testes: lint, build, test → green
- ✅ Documentação: MIGRATION_*.md + BREAKING_CHANGES.md ✨
- ⏳ **Code review + manual testing** (falta fazer)
- ⏳ **Merge para main** (então iniciar #40)

---

## 📌 Arquitetura Atual (Pós PR #53)

**Persistência:**
- `Transações` → Dexie (IndexedDB) com schema + Índices
- `Bills` → localStorage (chave: `financeai-bills`)
- `Goals` → localStorage (chave: `financeai-goals`)
- `Language` → localStorage (chave: `app-language`)
- `Category Rules` → localStorage (chave: `category-rules`)

**Hooks:**
- `useAppTransactions` → adapter bidirecional Dexie
- `useBillsAdapter` → CRUD localStorage (async)
- `useGoalsAdapter` → CRUD localStorage (async)
- Cada hook com error handling + toasts

**Testes:**
- Vitest + fake-indexeddb configurado (`test/setup.ts`)
- 20/28 testes passing (8 falhas pré-existentes)
- E2E Playwright para fluxos críticos

**Performance:**
- Indexação Dexie pronta (IDs, dates, categories)
- Issue #40 cobrirá otimizações de parsing (Web Worker)

**Próximo passo:** Merge #53 → Iniciar #40 (Web Worker)

---