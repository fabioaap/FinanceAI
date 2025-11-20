# 📋 Backlog - FinanceAI

**Data de atualização:** 20 de novembro de 2025  
**Status geral:** Parser + Upload implementados | Fase 2: Dashboard com analytics  
**Branch atual:** `copilot/add-bank-statement-parser`  
**Comparar com:** `main` (versão Spark Dashboard - 80% concluído)

---

## 📊 Visão Geral

| Fase | Features | Status | Progresso |
|------|----------|--------|-----------|
| **v0.1** | Parser OFX/CSV + Upload | ✅ Concluído | 100% |
| **v0.2** | Dashboard Financeiro | 🔄 Em Progresso | 30% |
| **v1.0** | Sync Cloud + Auth | ⏳ Planejado | 0% |
| **v2.0** | Mobile + API | ⏳ Futuro | 0% |

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

## 🔄 v0.2 - Em Progresso (Dashboard Financeiro)

### Features Planejadas

| # | Feature | Estimativa | Status | Prioridade |
|---|---------|-----------|--------|-----------|
| 1 | Dashboard com resumo (income/expense/balance) | 6h | ⏳ | 🟢 Alta |
| 2 | Categorização de transações (AI-powered) | 4h | ⏳ | 🟢 Alta |
| 3 | Gráficos de análise (Recharts) | 5h | ⏳ | 🟢 Alta |
| 4 | Gerenciador de Contas Bancárias | 4h | ⏳ | 🟡 Média |
| 5 | Histórico de transações com filtros | 4h | ⏳ | 🟡 Média |
| 6 | Detecção de duplicatas | 3h | ⏳ | 🟡 Média |
| 7 | Testes unitários completos | 6h | ⏳ | 🟡 Média |
| 8 | E2E tests com Playwright | 4h | ⏳ | 🟡 Média |

**Subtotal v0.2:** ~36 horas

### Arquitetura v0.2

```
src/
  components/
    ├── Dashboard/
    │   ├── SummaryCards.tsx       # Totalizadores
    │   ├── CategoryBreakdown.tsx  # Gráfico de categorias
    │   └── TransactionList.tsx    # Lista com filtros
    ├── FileUploader.tsx           # ✅ Reusar
    └── TransactionList.tsx        # ✅ Reusar
  
  lib/
    ├── bank-file-parser.ts        # Novo: Parser completo
    ├── categorizer.ts             # Novo: IA categorização
    └── duplicate-detector.ts      # Novo: Detecção duplicatas
  
  hooks/
    ├── useTransactions.ts         # Estado global
    └── useCategories.ts           # Cache de categorias
```

---

## ⏳ v1.0 - Futuro (Sync Cloud + Auth)

### Backend & Sync

| Feature | Estimativa | Tech | Status |
|---------|-----------|------|--------|
| Autenticação (OAuth2) | 6h | Supabase Auth | ⏳ |
| PostgreSQL Schema | 4h | Supabase | ⏳ |
| Sync bidirecional | 8h | SyncManager | ⏳ |
| Criptografia E2E | 6h | WebCrypto | ⏳ |
| Real-time updates | 4h | WebSocket | ⏳ |
| Testes + Monitoring | 6h | Vitest + Sentry | ⏳ |

**Subtotal v1.0:** ~34 horas

**Documentação referencial:** `docs/ISSUE_41_SYNC_ENGINE_PLAN.md`

---

## 🔄 Roadmap Visual

```
Nov 2025 (ATUAL)       Dec 2025              Jan 2026              Fev 2026
├─ ✅ v0.1 Release    ├─ v0.2 (Dashboard)  ├─ v1.0 (Cloud)      ├─ v2.0 (Mobile)
│  Parser + Upload    │  36h work           │  34h work           │  Mobile + API
│                     │  4 semanas          │  3 semanas          │  2+ semanas
└─ 15-18h done        └─ Beta testing      └─ Production ready  └─ Full platform
   Live              │  Analytics, AI     │  Multi-device      │  Sync enabled
```

**Progresso Total:**
- ✅ v0.1: 100% (15-18h) - CONCLUÍDO
- 🔄 v0.2: 0% (36h) - INICIANDO  
- ⏳ v1.0: 0% (34h) - BACKLOG
- ⏳ v2.0: 0% (TBD) - FUTURO

---

## 📈 Métricas Atuais

### Cobertura de Testes
- **Unit Tests:** Placeholder (`npm test` = echo)
- **E2E Tests:** Não implementados
- **Lint:** ✅ ESLint passing
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
- **Bundle Size (Main):** ~248KB gzipped (React 19 + parsers OFX/CSV)
  - **PDF Parser (Lazy chunk):** ~99KB gzipped (carregado sob demanda)
  - ✅ Main bundle dentro do alvo (250KB)
- **Build Time:** ~2-8s (Vite com chunk splitting)
- **Dev Server:** Hot reload funcional

---

## 🛠️ Stack Tecnológico

### Frontend (Atual - v0.1)
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool + dev server
- **Tailwind CSS 3.4** - Styling
- **PapaParse 5.5** - CSV parsing
- **fast-xml-parser 5.3** - OFX parsing
- **pdfjs-dist 4.3** - PDF text extraction

### Frontend (Planned - v0.2)
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
- **v0.1-v0.2:** localStorage only
- **v1.0+:** Supabase PostgreSQL + Real-time

---

## 🎯 Critérios de Sucesso

### v0.1 (✅ Concluído)
- ✅ Upload de arquivos OFX/CSV
- ✅ Parser robusto com error handling
- ✅ UI interativa com Tailwind
- ✅ TypeScript strict mode
- ✅ ESLint passing

### v0.2 (🔄 Em Progresso)
- 🎯 Dashboard com resumo financeiro (income/expense)
- 🎯 Categorização automática de transações
- 🎯 Gráficos de análise
- 🎯 Histórico com filtros avançados
- 🎯 Testes unitários (target 80% coverage)
- 🎯 E2E tests para fluxos principais

### v1.0 (⏳ Planejado)
- 🚀 Autenticação com Supabase
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
- ✅ Sem dependências pesadas (React + 2 parsers)
- ✅ 100% componentizado (2 componentes principais)
- ✅ TypeScript strict: segurança de tipos
- ✅ ESLint configured: code quality
- ✅ Tailwind configured: styling rápido

### v0.2 - Adições Planejadas
- Recharts para charts
- React Hook Form para forms
- localStorage para persistência local
- Categorização manual/automática

### v1.0+ - Infraestrutura
- Supabase backend
- Auth (OAuth2)
- Real-time WebSocket
- Criptografia E2E

### Considerações LGPD
- Dados locais (localStorage) - v0.1/0.2
- Consentimento explícito - v1.0
- Direito ao esquecimento - v1.0+
- Portabilidade de dados - v1.0+
- Ver: `docs/ISSUE_41_SYNC_ENGINE_PLAN.md` (main)

---

**Última atualização:** 20/11/2025  
**Branch:** `copilot/add-bank-statement-parser`  
**Responsável:** @fabioaap  
**Projeto:** FinanceAI - Importação de Extratos + Dashboard

**✅ v0.1 Pronto! 🔄 v0.2 Iniciando (36h) → v1.0 Planejado (34h)**
