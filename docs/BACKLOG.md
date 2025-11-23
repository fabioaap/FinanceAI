# BACKLOG - FinanceAI

Documento vivo com status das iniciativas priorizadas para upload/importacao, persistencia local e proximas fases (performance e sincronizacao).

---

## Done (9/11)

| Issue | Escopo | Status atual |
|-------|--------|--------------|
| #33 | Integrar `ImportBankFileModal` ao App | Botao Importar + fluxo completo com `handleImportComplete`, toasts e persistencia |
| #34 | Testes unitarios parser | 28 testes Vitest cobrindo CSV/OFX/TXT/QIF, datas, valores e sugestoes |
| #35 | Testes E2E Playwright | Suite `e2e/import-flow.spec.ts`, CI integrado |
| #36 | Detector de duplicadas | `duplicate-detector.ts` com hash + filtros |
| #37 | Suporte QIF | Parser completo para QIF |
| #38 | Mapeamento custom de categorias | Modal + armazenamento local + uso no parser |
| #39 | Upload multiplo | Drag & drop multiplo com preview |
| #42 | Pipeline CI | Lint + build + Vitest + Playwright + Codecov |
| #53 | Remover Spark, migrar para Dexie/localStorage | PR #53 pronta para merge (13 commits, docs completas) |

---

## Em execucao / Discovery

### Issue #40 - Web Worker para parser (+50k linhas)
- Status: Em execucao (delegado ao agente de nuvem)
- Branch esperada: `copilot/add-web-worker-for-parser`
- Tarefas:
  1. Criar `src/lib/workers/file-parser.worker.ts` com comunicacao via `postMessage`
  2. Adaptar `BankFileParser` para usar Worker + fallback
  3. Implementar progress updates e cancelamento
  4. Teste de carga com arquivo 50k linhas e comparativo de tempo
  5. Documentar em `docs/parser-performance.md`

### Issue #41 - Cloud sync + conflict resolution
- Status: Discovery
- Proximo passo: gerar `docs/SYNC_ARCHITECTURE_DRAFT.md` cobrindo API, estrategia de conflitos e requisitos de backend (NestJS + PostgreSQL)
- Dependencias: definicao de infra, autenticacao e politicas de merge

---

## Checklist Issue #53 (pre-merge)
1. Revisar PR #53 (13 commits) e validar docs de migracao
2. Executar `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e`
3. Testes manuais no browser (bills/goals/language + IndexedDB)
4. Comunicar breaking changes (IDs numericos, deps removidas)
5. Merge para `main` e monitoramento inicial

---

## Proximos marcos
1. Concluir Issue #40 e liberar release focado em performance
2. Finalizar discovery da Issue #41 e abrir epicos backend/frontend
3. Planejar roadmap pos-sync (OAuth, integracoes bancarias)
