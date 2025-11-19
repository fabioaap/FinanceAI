# BACKLOG - FinanceAI (Upload de Arquivos Bancários)

Este backlog documenta o trabalho já realizado (Done), o que está em andamento (In Progress) e o que ainda falta (To Do). O objetivo é manter todo o time alinhado, priorizar atividades e registrar critérios de aceite e responsáveis.

---

## ✅ Done
- Criar tipos TypeScript para upload e parse
  - Files: `src/lib/types.ts`
  - Critério de aceite: Tipos documentados e sem erros TypeScript
- Implementar parser multi-formato
  - Files: `src/lib/bank-file-parser.ts`
  - Critério de aceite: Suporta CSV, OFX e TXT; parsea datas/valores; sugestão de categorias
- Criar componente de upload (drag & drop + preview)
  - Files: `src/components/BankFileUpload.tsx`
  - Critério de aceite: Drag-and-drop funcional, validações, preview de transações
- Criar modal de importação e integração básica de importação
  - Files: `src/components/modals/ImportBankFileModal.tsx`
  - Critério de aceite: Conversão de `ParsedTransaction` para `Transaction`, callback `onImportComplete` implementado
- Documentação e exemplos de arquivo
  - Files: `docs/*` (`bank-file-upload.md`, `GUIA_INTEGRACAO.md`, `IMPLEMENTACAO_RESUMO.md`, `ARQUIVOS_CRIADOS.md`)
- **Issue #33:** Integrar `ImportBankFileModal` no `App.tsx` ✅
  - Botão "Importar Extrato" adicionado ao header com ícone `Upload`
  - Estado `showImportFile` gerenciado
  - Função `handleImportComplete` persiste transações no `useKV` e `Dexie`
  - Toast de sucesso exibido após importação
  - Files: `src/App.tsx`, `src/components/modals/ImportBankFileModal.tsx`
- **Issue #34:** Criar testes unitários para `bank-file-parser` ✅
  - Vitest configurado (`vitest.config.ts`)
  - 28 testes abrangentes cobrindo CSV, OFX, TXT, QIF, date/amount parsing, category suggestion
  - Scripts npm: `test`, `test:ui`, `test:coverage`
  - Files: `src/lib/bank-file-parser.test.ts`, `src/test/setup.ts`, `vitest.config.ts`
- **Issue #35:** Criar testes E2E para fluxo de upload/importação ✅
  - Playwright configurado (`playwright.config.ts`)
  - Testes E2E criados em `e2e/import-flow.spec.ts`
  - Script npm: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`
  - Files: `e2e/import-flow.spec.ts`, `playwright.config.ts`
- **Issue #36:** Detectar e prevenir transações duplicadas ✅
  - Módulo `duplicate-detector.ts` criado
  - Funções: `generateTransactionHash()`, `findDuplicates()`, `removeDuplicateTransactions()`
  - Integrado no `ImportBankFileModal` com UI para avisar duplicatas
  - Files: `src/lib/duplicate-detector.ts`
- **Issue #37:** Suporte para QIF ✅
  - Função `parseQIF()` adicionada ao `bank-file-parser.ts`
  - Type `BankFileFormat` atualizado para incluir `'qif'`
  - Detecção automática de formato QIF
  - Files: `src/lib/bank-file-parser.ts`, `src/lib/types.ts`
- **Issue #38:** Mapeamento de categorias customizável ✅
  - Interface `CategoryMappingRule` definida
  - Hook `useCategoryRules` para gerenciar regras no localStorage
  - Componente `CategoryMappingModal` com CRUD de regras
  - Suporte a regex e text matching
  - Files: `src/components/modals/CategoryMappingModal.tsx`, `src/hooks/use-category-rules.ts`
- **Issue #39:** Permitir múltiplos arquivos simultâneos ✅
  - BankFileUpload aceita múltiplos arquivos
  - Progress bar individual por arquivo e geral do lote
  - Processing paralelo com Promise.all
  - UI com status icons, badges e summary
  - Files: `src/components/BankFileUpload.tsx`
- **Issue #42:** CI (lint, build, testes) ✅
  - Pipeline `.github/workflows/ci.yml` criado
  - Executa em PRs e push para `main`
  - Steps: checkout, setup Node 20, install, lint, build, test, coverage
  - Files: `.github/workflows/ci.yml`

---

## 🔄 In Progress
_(Nenhuma issue em progresso no momento)_

---

## 📝 To Do (Prioridade Baixa / Futuro)
**Issue #40:** Otimizar parser para arquivos grandes (>10k linhas)
   - Técnica: WebWorker / stream parsing
   - Critério de aceite: tempo de parse aceitável, UI não travando
   - Estimativa: 2-3 dias

**Issue #41:** Integração com Sync Engine / armazenamento em nuvem
   - Sincronizar com backend; planejamento de conflict resolution
   - Critério de aceite: sincronização confiável com rollback
   - Estimativa: depende de infra

---

## 📌 Observações
- `@financeai/infra-db` é referenciado em `App.tsx`, mas pode não existir no workspace; confirme se prefere usar `useKV` ou conectar ao pacote.
- ✅ 8 de 10 issues do backlog original estão concluídas (80%)
- Apenas 2 issues futuras/baixa prioridade permanecem (#40 e #41)

---

## 📈 Sugestões rápidas
- Criar `docs/TEMPLATES/issue-backlog.md` para padronizar criação de items e critérios de aceite ✅
- Reunir dados de arquivos reais (anonimizados) para melhorar regras de categorização

---

## 🤖 Automação de Issues

✅ **Scripts criados para automatizar criação de issues e popular GitHub Project #2:**
- `scripts/issues.json` - Lista estruturada de todas as issues do backlog
- `scripts/create_issues_api.ps1` - Script PowerShell que cria issues via API REST e adiciona ao Project #2
- `scripts/README.md` - Instruções completas de uso

**Para executar:**
```pwsh
cd C:\Users\Educacross\Documents\FinanceAI
pwsh .\scripts\create_issues_api.ps1 -ProjectNumber 2 -Owner fabioaap -CreateLabels
```

Veja instruções completas em `scripts/README.md`

---