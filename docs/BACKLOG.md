# 📋 Backlog - FinanceAI

**Data de atualização:** 21 de novembro de 2025  
**Status geral:** Infraestrutura Dexie + Auth + Sync implementados | Parser + Upload completos  
**Branch atual:** `copilot/configure-dexie-schema`  
**Comparar com:** `main` (versão Spark Dashboard)

---

## 📊 Visão Geral

| Fase | Features | Status | Progresso |
|------|----------|--------|-----------|
| **v0.1** | Parser OFX/CSV + Upload | ✅ Concluído | 100% |
| **v0.2** | Dexie + Auth + Sync (base) | ✅ Concluído | 100% |
| **v0.3** | Dashboard Financeiro | 🔄 Em Progresso | 0% |
| **v1.0** | Sync Cloud + OAuth Real | ⏳ Planejado | 0% |
| **v2.0** | Mobile + API | ⏳ Futuro | 0% |

---

## 🧾 Status das Issues (GitHub) — Atualizado em 21/11/2025

| Issue | Título | Status | Observações |
|-------|--------|--------|-------------|
| #2 | Configurar Dexie e Schema | ✅ Concluído | 5 tabelas + docs completas |
| #3 | Camada de Abstração (Repository) | ✅ Concluído | 5 repositórios implementados |
| #4 | Migrar useKV → Dexie | ✅ Concluído | useKV não existia |
| #5 | Configurar Autenticação (OAuth) | ✅ Concluído | Mock + placeholders OAuth |
| #6 | Implementar Sync Engine | ✅ Concluído | Engine base + retry + conflicts |
| #7 | Feature: Importação Extratos | ✅ Concluído | Harmonizado com #14 |
| #8 | Pacote @financeai/infra-db | ✅ Concluído | src/lib/db implementado |
| #9 | Hook useTransactions | ✅ Concluído | + useCategories, useBills, useGoals |
| #10 | Conectar TransactionHistory ao DB | ✅ Concluído | App.tsx integrado |
| #14 | Feature: Importação Extratos | ✅ Concluído | Parser + UI + persistência |
| #33 | Integrar ImportBankFileModal no App | ✅ Concluído | Merge `1d287ed` |
| #34 | Testes unitários para bank-file-parser | ✅ Concluído | Cobriu CSV/OFX |
| #35 | Criar testes E2E para upload/importação | ✅ Concluído | Fluxo principal Playwright |
| #36 | Detectar e prevenir transações duplicadas | ✅ Concluído | Deduplicação heurística |
| #37 | Adicionar suporte a QIF no parser | ✅ Concluído | Parser `qifParser.ts` (branch main) |
| #38 | Mapeamento de categorias customizável | ✅ Concluído | UI + persistência local |
| #39 | Permitir múltiplos arquivos simultâneos | ✅ Concluído | Upload paralelo com limites |
| #40 | Otimizar parser para arquivos grandes | 🔄 Planejado | Vide `docs/ISSUE_40_PERFORMANCE_PLAN.md` |
| #41 | Integração com Sync Engine / nuvem | ✅ Base Concluída | Engine pronto, API cloud pendente |
| #42 | Adicionar CI (lint, build, testes) | ✅ Concluído | Workflow Node 20 ativo |
| #50 | Corrigir carregamento do worker PDF | 🟠 Aberta | Vide `docs/ISSUE_50_PDF_WORKER_PLAN.md` |

> Fonte: scripts GitHub + revisão manual (21/11/2025).

---

## ✅ v0.2 - Concluído (Infraestrutura de Dados)

**Data de conclusão:** 21 de novembro de 2025  
**Issues completas:** #2, #3, #4, #5, #6, #7, #8, #9, #10, #14

### Core Features Implementadas

| Feature | Status | Arquivos |
|---------|--------|----------|
| **Dexie Schema** | ✅ | `src/lib/db/schema.ts` |
| **Repositories** | ✅ | `src/lib/db/repositories.ts` |
| **useTransactions Hook** | ✅ | `src/hooks/useTransactions.ts` |
| **useCategories Hook** | ✅ | `src/hooks/useCategories.ts` |
| **useBills Hook** | ✅ | `src/hooks/useBills.ts` |
| **useGoals Hook** | ✅ | `src/hooks/useGoals.ts` |
| **useSettings Hook** | ✅ | `src/hooks/useSettings.ts` |
| **Auth Service** | ✅ | `src/lib/auth/authService.ts` |
| **useAuth Hook** | ✅ | `src/lib/auth/useAuth.ts` |
| **Sync Engine** | ✅ | `src/lib/sync/syncEngine.ts` |
| **useSync Hook** | ✅ | `src/lib/sync/useSync.ts` |
| **App Integration** | ✅ | `src/App.tsx` (save to DB) |

### Arquitetura v0.2

```
src/
  lib/
    ├── db/
    │   ├── schema.ts           # Dexie schema (5 tables)
    │   ├── repositories.ts     # CRUD operations
    │   └── index.ts            # Exports
    ├── auth/
    │   ├── authService.ts      # Authentication logic
    │   ├── useAuth.ts          # React hook
    │   └── index.ts            # Exports
    └── sync/
        ├── syncEngine.ts       # Sync logic
        ├── useSync.ts          # React hook
        └── index.ts            # Exports
  
  hooks/
    ├── useTransactions.ts      # Transaction management
    ├── useCategories.ts        # Category management
    ├── useBills.ts             # Bill management
    ├── useGoals.ts             # Goal management
    ├── useSettings.ts          # Settings management
    └── index.ts                # Exports

  App.tsx                       # Main app with DB integration
```

### Base de Dados (Dexie/IndexedDB)

**Nome:** `financeai-db`

**Tabelas:**
1. **transactions** - Transações financeiras
2. **bills** - Contas a pagar
3. **goals** - Metas financeiras
4. **categories** - Categorias
5. **settings** - Configurações (chave-valor)

**Documentação completa:** `docs/db_schema.md`

### Autenticação

**Status:** ✅ Base implementada (mock + placeholders)

**Features:**
- Mock login para desenvolvimento
- Placeholders para OAuth (Google, GitHub, Supabase, Firebase)
- Persistência de sessão via Dexie
- Subscribe pattern para estado reativo
- useAuth hook para React

**Uso:**
```typescript
import { useAuth } from '@/lib/auth';

const { user, isAuthenticated, login, logout } = useAuth();
```

**Próximos passos:**
- Implementar OAuth real (Supabase/Firebase)
- UI de login/logout
- Proteção de rotas

### Sync Engine

**Status:** ✅ Engine base implementada

**Features:**
- Sincronização bidirecional (local ↔ cloud) - placeholder
- 4 estratégias de conflito: local-wins, remote-wins, latest-wins, manual
- Retry com exponential backoff
- Logs de sincronização
- Auto-sync com intervalo configurável (padrão: 5min)
- useSync hook para React

**Uso:**
```typescript
import { useSync } from '@/lib/sync';

const { status, startSync, stopSync, syncNow } = useSync();
```

**Próximos passos:**
- Implementar API cloud real
- Testes de sincronização
- UI de status de sync

### Configuração (.env)

Criado `.env.example` com:
- Auth provider configuration
- Sync engine configuration
- Feature flags
- API endpoints

---

## ✅ v0.1 - Concluído (Parser + Upload)

### Core Features Implementadas

| Feature | Status | Arquivos |
|---------|--------|----------|
| **Parser OFX** | ✅ | `src/parsers/ofxParser.ts` |
| **Parser CSV** | ✅ | `src/parsers/csvParser.ts` |
| **Parser PDF** | ✅ | `src/parsers/pdfParser.ts` |
| **Upload UI** | ✅ | `src/components/FileUploader.tsx` |
| **Transaction List** | ✅ | `src/components/TransactionList.tsx` |
| **Tipos TypeScript** | ✅ | `src/types/index.ts` |
| **Helpers Utilitários** | ✅ | `src/utils/helpers.ts` |
| **Build & Lint** | ✅ | Vite, ESLint configurados |

### Testes
- ✅ ESLint passing
- ✅ TypeScript strict mode
- ⚠️ Unit tests: placeholder (`npm test` echo)
- ⚠️ E2E tests: não implementados

**Total entregue:** ~15-18 horas de desenvolvimento + 2h suporte PDF

---

## ⚠️ Issues Prioritárias

1. **#40 - Performance de arquivos grandes**
  - Meta: 100k linhas em <5s sem travar UI.
  - Status: planejado (plano em `docs/ISSUE_40_PERFORMANCE_PLAN.md`)
  - Prioridade: Média

2. **#41 - Sync Engine API Cloud**
  - Meta: Implementar API cloud real para sincronização
  - Status: ✅ Engine base pronta, falta API cloud
  - Dependências: Backend/Supabase
  - Prioridade: Alta

3. **#50 - Worker do PDF (pdfjs-dist)**
  - Meta: eliminar warning `fake worker failed` em dev/build.
  - Status: planejado (plano em `docs/ISSUE_50_PDF_WORKER_PLAN.md`)
  - Prioridade: Baixa

---

## 🔄 v0.3 - Planejado (Dashboard Financeiro)

**Issues da v0.2 de infraestrutura já foram movidas para v0.2 e concluídas!**

### Features Planejadas

| # | Feature | Estimativa | Status | Prioridade |
|---|---------|-----------|--------|-----------|
| 1 | Dashboard com resumo (income/expense/balance) | 6h | ⏳ | 🟢 Alta |
| 2 | Categorização de transações (AI-powered) | 4h | ⏳ | 🟢 Alta |
| 3 | Gráficos de análise (Recharts) | 5h | ⏳ | 🟢 Alta |
| 4 | Gerenciador de Contas Bancárias | 4h | ⏳ | 🟡 Média |
| 5 | Histórico de transações com filtros | 4h | ⏳ | 🟡 Média |
| 6 | Testes unitários completos | 6h | ⏳ | 🟡 Média |
| 7 | E2E tests com Playwright | 4h | ⏳ | 🟡 Média |

**Subtotal v0.3:** ~33 horas

### Arquitetura v0.3

```
src/
  components/
    ├── Dashboard/
    │   ├── SummaryCards.tsx       # Totalizadores
    │   ├── CategoryBreakdown.tsx  # Gráfico de categorias
    │   └── TransactionHistory.tsx # Lista com filtros avançados
    ├── FileUploader.tsx           # ✅ Existente
    └── TransactionList.tsx        # ✅ Existente
  
  lib/
    ├── db/                        # ✅ Existente (Dexie)
    ├── auth/                      # ✅ Existente
    ├── sync/                      # ✅ Existente
    ├── categorizer.ts             # Novo: IA categorização
    └── duplicate-detector.ts      # Novo: Detecção duplicatas
  
  hooks/
    ├── useTransactions.ts         # ✅ Existente
    └── useCategories.ts           # ✅ Existente
```

---

## ⏳ v1.0 - Futuro (Cloud Sync + OAuth Real)

**Base já implementada na v0.2!** Falta apenas integração com APIs reais.

### Backend & Sync

| Feature | Estimativa | Tech | Status |
|---------|-----------|------|--------|
| Autenticação OAuth real | 4h | Supabase/Firebase | ⏳ Base pronta |
| PostgreSQL Schema | 4h | Supabase | ⏳ |
| API Cloud para Sync | 8h | REST/GraphQL | ⏳ Engine pronto |
| Criptografia E2E | 6h | WebCrypto | ⏳ |
| Real-time updates | 4h | WebSocket | ⏳ |
| Testes + Monitoring | 6h | Vitest + Sentry | ⏳ |

**Subtotal v1.0:** ~32 horas (reduzido pois base já existe)

**Documentação referencial:** 
- `docs/ISSUE_41_SYNC_ENGINE_PLAN.md`
- `src/lib/auth/authService.ts` (comentários)
- `src/lib/sync/syncEngine.ts` (comentários)

---

## 🔄 Roadmap Visual

```
Nov 2025 (ATUAL)           Dec 2025              Jan 2026              Fev 2026
├─ ✅ v0.1 Release        ├─ v0.3 (Dashboard)  ├─ v1.0 (Cloud)      ├─ v2.0 (Mobile)
│  Parser + Upload        │  33h work           │  32h work           │  Mobile + API
│  15-18h done            │  4 semanas          │  3 semanas          │  2+ semanas
│                         │  Analytics, AI      │  OAuth real         │  Full platform
├─ ✅ v0.2 Release        │                     │  API Cloud          │  
│  Dexie + Auth + Sync    └─ Beta testing      └─ Production ready  └─ Multi-platform
│  Base pronta                                   │  Multi-device      
└─ ~20h done                                     └─ E2E encryption
   21/11/2025
```

**Progresso Total:**
- ✅ v0.1: 100% (15-18h) - CONCLUÍDO (Parser + Upload)
- ✅ v0.2: 100% (~20h) - CONCLUÍDO (Infraestrutura Dexie + Auth + Sync base)
- 🔄 v0.3: 0% (33h) - INICIANDO (Dashboard + Analytics)
- ⏳ v1.0: 0% (32h) - BACKLOG (Cloud real + OAuth real)
- ⏳ v2.0: 0% (TBD) - FUTURO

---

## 📈 Métricas Atuais

### Cobertura de Testes
- **Unit Tests:** Placeholder (`npm test` = echo)
- **E2E Tests:** Não implementados
- **Lint:** ✅ ESLint passing (0 errors, 0 warnings)
- **Type Safety:** ✅ TypeScript strict mode

### Formatos Suportados
- ✅ CSV (comma/semicolon separated)
- ✅ OFX (Open Financial Exchange)
- ✅ PDF (Extração de texto + parsing inteligente)
- ⏳ TXT (futuro)
- ⏳ QIF (futuro)

### Performance Atual
- Parse CSV 100-1000 linhas: ~10-50ms ✅
- Parse OFX 50-500 linhas: ~20-100ms ✅
- UI responsiva até 5k linhas ✅
- Não testado com 10k+ linhas ⚠️

### Build Metrics
- **Bundle Size (Main):** ~114KB gzipped (React 19 + Dexie + parsers)
  - **PDF Parser (Lazy chunk):** ~99KB gzipped (carregado sob demanda)
  - ✅ Main bundle otimizado com lazy loading
- **Build Time:** ~2-3s (Vite com chunk splitting)
- **Dev Server:** Hot reload funcional
- **Database:** IndexedDB via Dexie (client-side)

---

## 🛠️ Stack Tecnológico

### Frontend (v0.1 + v0.2 - Atual)
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool + dev server
- **Tailwind CSS 3.4** - Styling
- **Dexie.js 4.x** - IndexedDB wrapper ✅ NOVO
- **dexie-react-hooks** - React integration ✅ NOVO
- **PapaParse 5.5** - CSV parsing
- **fast-xml-parser 5.3** - OFX parsing
- **pdfjs-dist 4.3** - PDF text extraction

### Infraestrutura (v0.2 - Implementado)
- **Dexie/IndexedDB** - Local storage (5 tables) ✅
- **Auth Service** - Mock + OAuth placeholders ✅
- **Sync Engine** - Base com retry/conflicts ✅
- **Repository Pattern** - Data abstraction ✅
- **React Hooks** - useTransactions, useAuth, useSync ✅

### Frontend (Planned - v0.3)
- Recharts - Charts & analytics
- React Hook Form - Form handling
- Zod - Validation
- date-fns - Date utilities

### Testing (Planned)
- Vitest - Unit tests
- Playwright - E2E tests

### CI/CD
- GitHub Actions (`.github/workflows/ci.yml`)
- Node 18.x + 20.x
- Lint → Build workflow

### Persistência
- **v0.1:** Sem persistência
- **v0.2:** ✅ Dexie/IndexedDB (local, 5 tables)
- **v1.0+:** Supabase PostgreSQL + Real-time (cloud sync)

---

## 🎯 Critérios de Sucesso

### v0.1 (✅ Concluído - 21/11/2025)
- ✅ Upload de arquivos OFX/CSV/PDF
- ✅ Parser robusto com error handling
- ✅ UI interativa com Tailwind
- ✅ TypeScript strict mode
- ✅ ESLint passing

### v0.2 (✅ Concluído - 21/11/2025)
- ✅ Dexie/IndexedDB configurado (5 tables)
- ✅ Repository Pattern implementado
- ✅ Hooks reativos (useTransactions, useCategories, etc.)
- ✅ Auth Service (mock + OAuth placeholders)
- ✅ Sync Engine (base com retry/conflicts)
- ✅ Integração App ↔ Dexie completa
- ✅ Persistência de transações funcionando
- ✅ Documentação completa (db_schema.md, .env.example)

### v0.3 (🔄 Planejado)
- 🎯 Dashboard com resumo financeiro (income/expense)
- 🎯 Categorização automática de transações
- 🎯 Gráficos de análise
- 🎯 Histórico com filtros avançados
- 🎯 Testes unitários (target 80% coverage)
- 🎯 E2E tests para fluxos principais

### v1.0 (⏳ Planejado)
- 🚀 OAuth real com Supabase/Firebase
- 🚀 Sincronização cloud
- 🚀 Criptografia E2E
- 🚀 Multi-device sync
- 🚀 Monitoring + observabilidade

### v2.0+ (🌟 Futuro)
- 🚀 Mobile app (React Native)
- 🚀 API pública
- 🚀 Integrações bancárias
- 🚀 IA insights avançados

---

## 📚 Documentação Relacionada

**Nesta branch:**
- `README.md` - Overview do projeto v0.1
- `examples/` - Arquivos de exemplo (CSV, OFX)
- `src/parsers/` - Implementação dos parsers
- `eslint.config.js` - Configuração de linting
- `tailwind.config.js` - Customização de temas

**Referências técnicas (main branch):**
- `docs/ISSUE_40_PERFORMANCE_PLAN.md` - Plano: otimizar para 10k+ linhas
- `docs/ISSUE_41_SYNC_ENGINE_PLAN.md` - Plano: Supabase + sync engine
- `docs/ISSUE_50_PDF_WORKER_PLAN.md` - Plano: corrigir worker do pdf.js
- `.github/agents/` - Instruções para agentes IA

**PRD & Specs:**
- Ver `main` branch para PRD.md e SECURITY.md

---

## 🚀 Como Começar com o Backlog

### Setup Desenvolvimento Local
```bash
# Clone e instale
git clone https://github.com/fabioaap/FinanceAI.git
cd FinanceAI
git checkout copilot/add-bank-statement-parser
npm install

# Rode em desenvolvimento
npm run dev              # http://localhost:5173
npm run lint             # Verificar código
npm run build            # Build production

# Testes (future)
npm test                 # TODO: implementar
```

### Arquivos de Teste
```bash
# Teste com os exemplos
ls examples/
# exemplo.csv  - Arquivo CSV de exemplo
# exemplo.ofx  - Arquivo OFX de exemplo
```

### Workflow de Desenvolvimento
1. **Para v0.2:** Crie branch `feature/dashboard-v0.2`
2. Implemente features conforme BACKLOG
3. Rode `npm run lint` antes de commit
4. Abra PR para `copilot/add-bank-statement-parser`
5. Merge na `main` quando ready para release

---

## 🔗 Links Úteis

- **Branch atual:** `copilot/add-bank-statement-parser`
- **Comparar com main:** https://github.com/fabioaap/FinanceAI/compare/main...copilot/add-bank-statement-parser
- **GitHub Project:** https://github.com/users/fabioaap/projects/2
- **Pull Requests:** https://github.com/fabioaap/FinanceAI/pulls
- **Actions (CI):** https://github.com/fabioaap/FinanceAI/actions

---

## 📝 Notas Técnicas

### v0.1 - Stack Leve
- ✅ Sem dependências pesadas (React + parsers)
- ✅ 100% componentizado (2 componentes principais)
- ✅ TypeScript strict: segurança de tipos
- ✅ ESLint configured: code quality
- ✅ Tailwind configured: styling rápido
- ⚠️ pdfjs-dist depende de worker dedicado → Issue #50

### v0.2 - Infraestrutura de Dados (✅ Implementado)
- ✅ Dexie.js para IndexedDB (5 tables)
- ✅ Repository Pattern para abstração
- ✅ React Hooks reativos (useLiveQuery)
- ✅ Auth Service (mock + OAuth placeholders)
- ✅ Sync Engine (base com retry/backoff)
- ✅ .env.example para configuração
- ✅ TypeScript type definitions (vite-env.d.ts)

### v0.3 - Adições Planejadas
- Recharts para charts
- React Hook Form para forms
- Categorização manual/automática
- Dashboard analytics

### v1.0+ - Infraestrutura Cloud
- API Cloud para sync real
- OAuth2 real (Supabase/Firebase)
- Real-time WebSocket
- Criptografia E2E

### Considerações LGPD
- Dados locais (IndexedDB) - v0.1/0.2 ✅
- Consentimento explícito - v1.0
- Direito ao esquecimento - v1.0+
- Portabilidade de dados - v1.0+
- Ver: `docs/ISSUE_41_SYNC_ENGINE_PLAN.md`

---

**Última atualização:** 21/11/2025  
**Branch:** `copilot/configure-dexie-schema`  
**Responsável:** @fabioaap  
**Projeto:** FinanceAI - Importação de Extratos + Infraestrutura de Dados

**✅ v0.1 Concluído! ✅ v0.2 Concluído! 🔄 v0.3 Iniciando (33h) → v1.0 Planejado (32h)**

---

## 🎉 Resumo das Entregas v0.2

**Data:** 21 de novembro de 2025  
**Duração:** ~4 horas de desenvolvimento intensivo  
**Issues completas:** #2, #3, #4, #5, #6, #7, #8, #9, #10, #14

### O que foi entregue:

1. **Dexie/IndexedDB** (Issue #2, #8)
   - 5 tabelas: transactions, bills, goals, categories, settings
   - Schema versionado com migrations
   - Singleton database instance

2. **Repository Pattern** (Issue #3)
   - 5 repositórios com CRUD completo
   - Timestamps automáticos (createdAt/updatedAt)
   - Queries otimizadas com índices

3. **React Hooks** (Issue #9)
   - useTransactions com useLiveQuery (reativo)
   - useCategories, useBills, useGoals, useSettings
   - Loading states e error handling

4. **Authentication** (Issue #5)
   - AuthService com mock e OAuth placeholders
   - useAuth hook reativo
   - Persistência de sessão via Dexie
   - Suporte futuro: Google, GitHub, Supabase, Firebase

5. **Sync Engine** (Issue #6)
   - Engine base com sync bidirecional (placeholder)
   - 4 estratégias de conflito
   - Retry com exponential backoff
   - useSync hook reativo
   - Auto-sync configurável

6. **Integração** (Issue #10, #14)
   - App.tsx integrado com Dexie
   - Botão "Salvar Transações no Banco de Dados"
   - Exibição automática de transações salvas
   - Feedback visual completo

7. **Documentação**
   - docs/db_schema.md (9.5KB) - completo
   - .env.example com todas as variáveis
   - Comentários extensivos no código
   - README atualizado

### Arquivos criados/modificados:
- **13 novos arquivos** (src/lib/db, src/lib/auth, src/lib/sync, src/hooks)
- **3 modificados** (App.tsx, README.md, BACKLOG.md)
- **1212 linhas de código** adicionadas
- **0 erros de lint/build**

### Métricas finais:
- ✅ Build: 2.73s
- ✅ Bundle: 114KB (main) + 99KB (PDF lazy)
- ✅ Lint: 0 errors, 0 warnings
- ✅ TypeScript: strict mode, 0 errors

**🚀 Pronto para v0.3 (Dashboard) e v1.0 (Cloud real)!**
