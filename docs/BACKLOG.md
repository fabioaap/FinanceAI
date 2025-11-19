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

---

## 🔄 In Progress
1. Integrar `ImportBankFileModal` no `App.tsx`
   - O que fazer:
     - Adicionar botão no header (`Importar Extrato`)
     - Adicionar `showImportFile` no estado
     - Implementar `handleImportComplete` para gravar no `useKV`/Dexie
     - Testar com `docs/examples/*`
   - Critério de aceite:
     - Botão abre modal e a importação adiciona transações ao estado e persiste conforme política de armazenamento
   - Responsável: @fabioaap
   - Estimativa: 1h

---

## 📝 To Do (Prioridade Alta)
2. Criar testes unitários para `bank-file-parser`
   - Abordagem: Vitest/Jest + fixtures em `docs/examples`
   - Casos:
     - CSV formatos (vírgula e ponto-e-vírgula)
     - OFX com e sem MEMO
     - TXT com padrões variados
     - Datas inválidas e valores malformados
   - Critério de aceite: cobertura >= 80% das rotinas principais
   - Estimativa: 2-3h

3. Criar testes E2E para fluxo de upload/importação
   - Ferramenta: Playwright / Cypress
   - Fluxo:
     - Abrir modal, dropar arquivo, visualizar prévia, confirmar import
     - Validar inserção na UI e persistência local
   - Critério de aceite: testes automatizados na pipeline
   - Estimativa: 3-4h

4. Detectar e prevenir transações duplicadas
   - Estratégia: gerar hash por `date + amount + description` antes de inserir
   - UI: mostrar alert/checkbox na preview para ignorar/mesclar duplicatas
   - Critério de aceite: não inserir duplicatas e opção de mesclagem
   - Estimativa: 3h

---

## 🧭 To Do (Prioridade Média)
5. Suporte para QIF
   - Adicionar `parseQIF()` e atualizar `BankFileFormat`
   - Critério de aceite: arquivos QIF são parseados corretamente
   - Estimativa: 2-3h

6. Mapeamento de categorias customizável
   - UI para mapear descrições/palavras-chave para categorias
   - Persistir regras no DB local (Dexie)
   - Critério de aceite: usuário consegue criar regra, e parser aplica regras no processamento
   - Estimativa: 4-5h

7. Permitir múltiplos arquivos simultâneos
   - UI: aceitar array de arquivos no upload
   - UX: barra de progresso por arquivo e por lote
   - Critério de aceite: múltiplos arquivos processados com feedback
   - Estimativa: 4h

---

## ⚙️ To Do (Prioridade Baixa / Futuro)
8. Otimizar parser para arquivos grandes (>10k linhas)
   - Técnica: WebWorker / stream parsing
   - Critério de aceite: tempo de parse aceitável, UI não travando
   - Estimativa: 2-3 dias

9. Integração com Sync Engine / armazenamento em nuvem
   - Sincronizar com backend; planejamento de conflict resolution
   - Critério de aceite: sincronização confiável com rollback
   - Estimativa: depende de infra

10. CI (lint, build, testes)
   - Integrar pipeline (GitHub Actions) com lint, build e testes
   - Critério de aceite: pipeline em PRs
   - Estimativa: 4h

---

## 📌 Observações
- `@financeai/infra-db` é referenciado em `App.tsx`, mas pode não existir no workspace; confirme se prefere usar `useKV` ou conectar ao pacote.
- Criar issues no repo para cada item do backlog facilita acompanhamento e atribuição; posso criar PRs/Issues se desejar.

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