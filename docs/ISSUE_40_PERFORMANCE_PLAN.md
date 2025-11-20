# Issue #40: Otimizar Parser para Arquivos Grandes

## 📋 Objetivo
Melhorar performance do parser de arquivos bancários para suportar arquivos >10k linhas sem travar a UI.

**Target:** Arquivos de até 100k linhas devem processar em <5 segundos sem bloquear interface.

---

## 🎯 Problemas Atuais

### 1. **Parsing Síncrono**
```typescript
// bank-file-parser.ts - linha 35
async parse(file: File): Promise<BankFileParseResult> {
    this.fileContent = await this.readFile(file)  // ❌ Carrega tudo na memória
    this.format = this.detectFormat(file.name, this.fileContent)
    const transactions = this.parseByFormat(this.format)  // ❌ Processa tudo de uma vez
    // ...
}
```

**Problemas:**
- ❌ UI trava durante parsing (main thread bloqueada)
- ❌ Arquivo inteiro carregado na memória (>10MB podem causar crash)
- ❌ Sem feedback de progresso

### 2. **Falta de Chunking**
- Parser processa linha por linha mas sem yields
- Não há streaming ou processamento incremental
- Usuário não sabe se travou ou está processando

---

## 🏗️ Arquitetura da Solução

### **Abordagem Multi-Camada**

```
┌─────────────────────────────────────────────────┐
│            UI Component (React)                  │
│  ┌──────────────────────────────────────────┐  │
│  │  BankFileUpload.tsx                      │  │
│  │  - Progress bar (0-100%)                 │  │
│  │  - Cancel button                         │  │
│  │  - Chunk status (1/10, 2/10...)          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────┘
                      │ postMessage()
                      ▼
┌─────────────────────────────────────────────────┐
│         Web Worker (worker-parser.ts)            │
│  ┌──────────────────────────────────────────┐  │
│  │  StreamingParser                         │  │
│  │  - Read file in chunks (1MB cada)        │  │
│  │  - Parse incrementalmente                │  │
│  │  - Report progress (onProgress)          │  │
│  │  - Return chunks or full result          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 📦 Implementação por Etapas

### **Etapa 1: Web Worker Básico (4h)**

**Arquivos a criar:**
```
src/
  lib/
    workers/
      bank-parser.worker.ts    # Web Worker principal
      worker-types.ts          # Types para mensagens Worker
```

**`bank-parser.worker.ts`:**
```typescript
import { BankFileParser } from '../bank-file-parser'

interface WorkerMessage {
  type: 'parse'
  file: File
  customRules?: CategoryMappingRule[]
}

interface WorkerResponse {
  type: 'progress' | 'complete' | 'error'
  progress?: number
  result?: BankFileParseResult
  error?: string
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, file, customRules } = e.data
  
  if (type === 'parse') {
    try {
      const parser = new BankFileParser(file, customRules)
      
      // TODO: Adicionar callback de progresso
      const result = await parser.parse(file)
      
      self.postMessage({
        type: 'complete',
        result
      } as WorkerResponse)
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as WorkerResponse)
    }
  }
}
```

**Integração no `BankFileUpload.tsx`:**
```typescript
const worker = useMemo(() => new Worker(
  new URL('../lib/workers/bank-parser.worker.ts', import.meta.url),
  { type: 'module' }
), [])

const handleFileParse = async (file: File) => {
  setProgress(0)
  
  worker.postMessage({ type: 'parse', file, customRules })
  
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    if (e.data.type === 'progress') {
      setProgress(e.data.progress!)
    } else if (e.data.type === 'complete') {
      onParseComplete(e.data.result!)
    }
  }
}
```

**Testes:**
```typescript
// bank-parser.worker.test.ts
describe('BankParserWorker', () => {
  it('should parse file in worker thread', async () => {
    const worker = new Worker('./bank-parser.worker.ts')
    const file = new File(['...'], 'test.csv')
    
    worker.postMessage({ type: 'parse', file })
    
    const result = await new Promise(resolve => {
      worker.onmessage = (e) => resolve(e.data)
    })
    
    expect(result.type).toBe('complete')
  })
})
```

---

### **Etapa 2: Stream Parsing (6h)**

**Objetivo:** Processar arquivo em chunks sem carregar tudo na memória.

**`streaming-parser.ts`:**
```typescript
export class StreamingParser {
  private chunkSize = 1024 * 1024 // 1MB chunks
  
  async parseStream(
    file: File,
    onProgress: (progress: number) => void,
    onChunk: (transactions: ParsedTransaction[]) => void
  ): Promise<void> {
    const totalSize = file.size
    let processedBytes = 0
    let buffer = ''
    
    const reader = file.stream().getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // Process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line
      
      const transactions = this.parseLines(lines)
      onChunk(transactions)
      
      processedBytes += value.byteLength
      onProgress((processedBytes / totalSize) * 100)
    }
    
    // Process remaining buffer
    if (buffer) {
      const transactions = this.parseLines([buffer])
      onChunk(transactions)
    }
    
    onProgress(100)
  }
  
  private parseLines(lines: string[]): ParsedTransaction[] {
    // Reusa lógica do BankFileParser
    return lines.map(line => this.parseLine(line)).filter(Boolean)
  }
}
```

**Integração Worker:**
```typescript
// bank-parser.worker.ts
import { StreamingParser } from '../streaming-parser'

const streamParser = new StreamingParser()

await streamParser.parseStream(
  file,
  (progress) => {
    self.postMessage({ type: 'progress', progress })
  },
  (transactions) => {
    self.postMessage({ type: 'chunk', transactions })
  }
)
```

---

### **Etapa 3: Benchmarks e Testes de Performance (3h)**

**`benchmarks/parser-performance.bench.ts`:**
```typescript
import { bench, describe } from 'vitest'
import { BankFileParser } from '../src/lib/bank-file-parser'
import { StreamingParser } from '../src/lib/streaming-parser'

describe('Parser Performance', () => {
  const sizes = [100, 1000, 10000, 100000] // linhas
  
  sizes.forEach(size => {
    bench(`parse ${size} lines - sync`, async () => {
      const file = generateCSV(size)
      const parser = new BankFileParser(file)
      await parser.parse(file)
    })
    
    bench(`parse ${size} lines - streaming`, async () => {
      const file = generateCSV(size)
      const parser = new StreamingParser()
      await parser.parseStream(file, () => {}, () => {})
    })
  })
})

function generateCSV(lines: number): File {
  const content = [
    'Date,Description,Amount',
    ...Array.from({ length: lines }, (_, i) => 
      `2025-01-${(i % 28) + 1},Transaction ${i},${Math.random() * 1000}`
    )
  ].join('\n')
  
  return new File([content], 'test.csv', { type: 'text/csv' })
}
```

**CI Integration (`.github/workflows/ci.yml`):**
```yaml
- name: Run performance benchmarks
  run: npm run bench -- --reporter=json > bench-results.json

- name: Upload benchmark results
  uses: actions/upload-artifact@v4
  with:
    name: benchmark-results
    path: bench-results.json
```

---

### **Etapa 4: UI com Feedback de Progresso (2h)**

**Componente de Progress:**
```typescript
// components/FileParsingProgress.tsx
export function FileParsingProgress({ 
  progress, 
  fileName, 
  linesProcessed,
  totalLines,
  onCancel 
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{fileName}</span>
        <span className="text-sm text-muted-foreground">
          {progress.toFixed(0)}%
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {linesProcessed.toLocaleString()} / {totalLines.toLocaleString()} linhas
        </span>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
```

---

## 📊 Critérios de Aceite

### Performance Targets
- ✅ **1k linhas:** <200ms (sem worker)
- ✅ **10k linhas:** <1s (com worker)
- ✅ **100k linhas:** <5s (com streaming)
- ✅ **UI responsiva:** 60fps durante parsing

### Funcionalidades
- ✅ Progress bar em tempo real
- ✅ Botão de cancelar parsing
- ✅ Feedback de linhas processadas
- ✅ Error handling robusto
- ✅ Fallback para sync se worker falhar

### Testes
- ✅ 100% cobertura dos novos módulos
- ✅ Benchmarks automatizados no CI
- ✅ E2E test com arquivo de 50k linhas
- ✅ Teste de cancelamento

---

## 🚀 Rollout Strategy

### Fase Alpha (Week 1)
- Implementar Web Worker básico
- Feature flag: `ENABLE_WORKER_PARSER=false`
- Testar com usuários internos

### Fase Beta (Week 2)
- Adicionar streaming
- Feature flag: `ENABLE_WORKER_PARSER=true` (50% users)
- Monitorar metrics (Sentry)

### Fase Production (Week 3)
- 100% rollout
- Remover código legacy sync
- Documentar performance gains

---

## 📈 Métricas de Sucesso

**A monitorar:**
- Parse time (p50, p95, p99)
- Memory usage durante parsing
- Error rate
- User cancellations
- File size distribution

**Ferramentas:**
- Performance API: `performance.measure()`
- Sentry: Custom spans
- Analytics: Parse completion rate

---

## 🔧 Configuração de Desenvolvimento

**package.json:**
```json
{
  "scripts": {
    "bench": "vitest bench",
    "bench:watch": "vitest bench --watch",
    "test:perf": "vitest run --config vitest.perf.config.ts"
  },
  "devDependencies": {
    "@vitest/ui": "^4.0.0",
    "vite-plugin-web-worker-loader": "^1.0.0"
  }
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import webWorkerLoader from 'vite-plugin-web-worker-loader'

export default defineConfig({
  plugins: [
    webWorkerLoader()
  ],
  worker: {
    format: 'es'
  }
})
```

---

**Estimativa Total:** 15-18 horas
**Prioridade:** Alta
**Dependencies:** Nenhuma
**Risk:** Baixo (feature adicional, não quebra funcionalidade existente)
