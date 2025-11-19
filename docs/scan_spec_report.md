# Relatório de conformidade da spec - FinanceAI

Este arquivo resume o mapeamento entre a spec do prompt e a implementação atual no repositório.

## Implementado (por item)
- Painel principal mensal (dashboard) com cartões de resumo, gráfico de categorias, lembretes, metas e timeline visual mínima
  - Arquivos: `src/App.tsx`, `src/components/dashboard/*`
- Modais: adicionar transação, conta, meta e configurações (idioma)
  - Arquivos: `src/components/modals/*`
- Internacionalização (inglês e pt-BR)
  - Arquivo: `src/lib/i18n.ts`
- Persistência minimal: `useKV` via `@github/spark/hooks`
  - Arquivo: `src/App.tsx` (usa `useKV` para `transactions`, `bills`, `goals`)
- Integração com IA (LLM) via `window.spark.llm` (AIInsights)
  - Arquivo: `src/components/dashboard/AIInsights.tsx`
- UI e tema com Tailwind e design system local `src/components/ui/*`

## Não implementado ou incompleto (por item)
- Autenticação OAuth (Google / Microsoft) e permissões de pasta - NÃO
- Importador de extratos (CSV/PDF/XLSX), pré-visualização e categorização - NÃO
- Armazenamento local baseado em IndexedDB com Dexie e engine de sincronização incremental - parcialmente: `useKV` é usado, mas não há IndexedDB/Dexie e não existe sync com Google Drive/OneDrive
- Sincronização com Google Drive ou OneDrive e criptografia com WebCrypto - NÃO
- Estado global com Zustand / React Query para sync/requests - NÃO (apenas `useKV` e hooks locais)
- Configurações completas (tema, moeda, notificações, estado de sincronização) - parcial: idioma implementado, resto ausente
- Pipeline CI (`.github/workflows/ci.yml`) - NÃO
- Dockerfile para dev / docs - `.devcontainer` existe, mas Dockerfile para dev não está em `docker/` - NÃO
- Documentação: `docs/` vazia/missing, ADR ausente - NÃO
- Tests: faltam testes unitários e E2E - NÃO

## Conclusão
A maior parte da camada de apresentação do MVP (UI, layout, modais e i18n) está implementada. A infra crítica do MVP — IndexedDB local, sincronização com nuvem pessoal, importador de extratos e autenticação OAuth — não foi criada.

## Próximos passos sugeridos (priorizados)
1. Implementar IndexedDB via Dexie e migrar o `useKV` para o mecanismo local (ou criar adaptações) — crítico para o modelo offline-first.
2. Implementar sync engine com Google Drive / OneDrive + criptografia (WebCrypto) — central à spec de dados pessoais do usuário.
3. Criar importador de extratos (CSV/XLSX) com pré-visualização e sugestão de categoria.
4. Criar OAuth minimal para Google / Microsoft (apenas escopo de pasta do app) + UI de escolha.
5. Adicionar `docs/` e ADR, e um `.github/workflows/ci.yml` básico com lint + build + testes.

