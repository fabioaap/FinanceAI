# Issue #50: Corrigir carregamento do worker do PDF (pdfjs-dist)

## 📍 Contexto
- Os uploads de PDF exibem o aviso: `Setting up fake worker failed: Failed to fetch dynamically imported module: http://localhost:3000/libs/pdf.worker.min.js?import`.
- O pdf.js depende de um *worker* dedicado. Sem ele, a extração de texto cai em *fallback* e pode falhar em arquivos grandes.
- Já testamos três abordagens (CDN, caminho direto em `node_modules`, cópia manual para `public/`). Todas funcionam no build, mas falham no dev server devido a como o Vite trata `?import`.

## 🎯 Objetivo
Garantir que o worker do pdf.js seja carregado automaticamente em `dev`, `build` e ambientes de deploy (Vercel/Static hosting) sem exigir configuração manual do usuário.

## 📦 Escopo
1. Resolver o carregamento do worker.
2. Padronizar a inicialização do parser (`parsePDF`).
3. Adicionar teste manual automatizado (Playwright smoke) para upload de PDF sample.
4. Atualizar documentação e backlog.

## 🚧 Fora de escopo
- Refatorar parsing de PDF.
- Otimizar tamanho do bundle (já controlado via *code splitting*).

## 🧱 Abordagem Técnica
| Etapa | Descrição | Detalhes |
|-------|-----------|----------|
| **1. Diagnóstico** (1h) | Reproduzir erro em `npm run dev` e `preview`. | Ativar `?import` logging e confirmar origem no Vite (`import.meta.glob` interna). |
| **2. Worker embalado via Vite** (2h) | Utilizar `new URL('pdf.worker.min.js', import.meta.url)` com import ESM oficial. | `import 'pdfjs-dist/build/pdf.worker.mjs';` + `pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', import.meta.url).toString();` |
| **3. Build custom** (1h) | Alternativa: usar `vite-plugin-workers` ou `pdfjs-dist/webpack`. | Mantém compatibilidade com browsers antigos. |
| **4. QA manual + automação** (2h) | Criar spec Playwright simples que faz upload de PDF (`docs/examples/LEIA-PDF.pdf`). | Valida ausência do warning + presença de transações. |
|
Tempo total estimado: **6 horas**.

## ✅ Critérios de Aceite
- Nenhum warning "Setting up fake worker failed" no console em dev/build.
- Upload de PDF processa transações no ambiente de preview/produção.
- Teste Playwright dedicado (`e2e/pdf-worker.spec.ts`) passando no CI.
- Documentação (`BACKLOG.md`, `README.md`) instruindo uso.

## 📊 Métricas
| Métrica | Meta |
|---------|------|
| Taxa de erro no upload de PDF | 0% em dev/preview |
| Tempo de carregamento adicional | < +10 KB gzip no bundle principal |
| Confiabilidade do teste | 100% passada no CI |

## 🔗 Dependências
- `pdfjs-dist@4.3.x`
- Vite 7.x
- Playwright (já configurado)

## ⚠️ Riscos
1. Worker continua falhando em ambientes restritos (ex: extensões browser). Mitigação: fallback com aviso claro.
2. A importação ESM oficial aumenta bundle. Mitigação: manter chunk separado e lazy-load.
3. Tempo de build aumenta. Mitigação: cache `node_modules/.vite` e testar apenas quando arquivos de PDF mudarem.

## 🧪 Plano de Testes
1. **Manual:** upload de `docs/examples/extrato-exemplo.pdf` em `npm run dev` e `npm run preview`.
2. **Automatizado:** novo teste Playwright que gera fixture e valida ausência de warnings (hook em console).
3. **Regression:** rodar `npm run build && npm run preview` antes do PR.

## 📜 Entregáveis
- Código ajustado em `src/parsers/pdfParser.ts`.
- Novo teste Playwright (`e2e/pdf-worker.spec.ts`).
- Documentação atualizada (`BACKLOG.md`, `README.md`, `docs/PDF_IMPLEMENTATION.md`).
- Registro no changelog (caso aplique).

## 🗓️ Linha do tempo sugerida
1. Diagnóstico + PoC: **2h**.
2. Implementação worker + testes: **3h**.
3. Documentação + PR review: **1h**.

## ✅ Pronto quando...
- Build + lint + testes E2E passam no CI.
- Sem warnings no console.
- PR aprovado e merged.
