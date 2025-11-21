# 🚀 Guia Rápido de Integração

## 📋 Checklist de Implementação

### ✅ Arquivos Criados (Pronto para Usar)

- [x] `src/lib/types.ts` - Tipos atualizados
- [x] `src/lib/bank-file-parser.ts` - Parser completo
- [x] `src/components/BankFileUpload.tsx` - Componente de UI
- [x] `src/components/modals/ImportBankFileModal.tsx` - Modal pronto

### 🔨 Integração no App.tsx (5 minutos)

#### Passo 1: Adicionar Import
```typescript
// No topo do App.tsx
import { ImportBankFileModal } from '@/components/modals/ImportBankFileModal'
import { Upload } from '@phosphor-icons/react'
```

#### Passo 2: Adicionar Estado
```typescript
// Dentro da função App()
const [showImportFile, setShowImportFile] = useState(false)
```

#### Passo 3: Adicionar Handler
```typescript
// Após os outros handlers
const handleImportComplete = (importedTransactions: Transaction[]) => {
  // Adiciona ao estado existente
  setTransactions((current) => [...(current || []), ...importedTransactions])
  
  // Notificação
  toast.success(`${importedTransactions.length} transação(ões) importada(s)!`)
}
```

#### Passo 4: Adicionar Botão no Header
```typescript
// No <header>, ao lado dos outros botões:
<Button
  variant="outline"
  onClick={() => setShowImportFile(true)}
  className="gap-2"
>
  <Upload size={20} weight="bold" />
  {t.import?.button || 'Importar'}
</Button>
```

#### Passo 5: Adicionar Modal
```typescript
// Antes de </div> final, com os outros modais:
<ImportBankFileModal
  open={showImportFile}
  onOpenChange={setShowImportFile}
  onImportComplete={handleImportComplete}
/>
```

## 🎯 Código Completo das Mudanças

```typescript
// ============================================
// IMPORTS (adicione no topo)
// ============================================
import { ImportBankFileModal } from '@/components/modals/ImportBankFileModal'
import { Upload } from '@phosphor-icons/react'

function App() {
  // ============================================
  // ESTADOS (adicione com os outros estados)
  // ============================================
  const [showImportFile, setShowImportFile] = useState(false)

  // ... estados existentes ...

  // ============================================
  // HANDLERS (adicione com os outros handlers)
  // ============================================
  const handleImportComplete = (importedTransactions: Transaction[]) => {
    setTransactions((current) => [...(current || []), ...importedTransactions])
    toast.success(`${importedTransactions.length} transação(ões) importada(s)!`)
  }

  // ... handlers existentes ...

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.app.title}</h1>
            <p className="text-muted-foreground">{t.app.subtitle}</p>
          </div>
          
          {/* ============================================ */}
          {/* BOTÕES DO HEADER (adicione o novo botão) */}
          {/* ============================================ */}
          <div className="flex gap-2">
            {/* NOVO BOTÃO AQUI ⬇️ */}
            <Button
              variant="outline"
              onClick={() => setShowImportFile(true)}
              className="gap-2"
            >
              <Upload size={20} weight="bold" />
              Importar
            </Button>
            
            {/* ... outros botões existentes ... */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Gear size={20} weight="bold" />
            </Button>
            {/* ... */}
          </div>
        </header>

        {/* ... conteúdo existente ... */}

      </div>

      {/* ============================================ */}
      {/* MODAIS (adicione o novo modal) */}
      {/* ============================================ */}
      
      {/* ... modais existentes ... */}
      <AddTransactionModal ... />
      <AddBillModal ... />
      <AddGoalModal ... />
      <SettingsModal ... />

      {/* NOVO MODAL AQUI ⬇️ */}
      <ImportBankFileModal
        open={showImportFile}
        onOpenChange={setShowImportFile}
        onImportComplete={handleImportComplete}
      />

      <Toaster />
    </div>
  )
}
```

## 🧪 Testar a Integração

### 1. Usar Arquivos de Exemplo
```bash
# Os arquivos de teste estão em:
docs/examples/extrato-exemplo.csv
docs/examples/extrato-banco-brasil.csv
docs/examples/extrato-simples.txt
```

### 2. Fluxo de Teste
1. Clique no botão "Importar"
2. Arraste um dos arquivos de exemplo
3. Visualize o preview das transações
4. Clique em "Importar Transações"
5. Verifique as transações no dashboard

## 🎨 Personalizar (Opcional)

### Alterar Ícone do Botão
```typescript
// Use qualquer ícone do Phosphor
import { FileArrowUp } from '@phosphor-icons/react'

<FileArrowUp size={20} weight="bold" />
```

### Adicionar Tradução
```typescript
// Em src/lib/i18n.ts
export const translations = {
  'pt-BR': {
    import: {
      button: 'Importar Extrato',
      success: 'transação(ões) importada(s) com sucesso!',
    }
  },
  'en': {
    import: {
      button: 'Import Statement',
      success: 'transaction(s) imported successfully!',
    }
  }
}

// No botão:
{t.import?.button || 'Importar'}

// No toast:
toast.success(`${importedTransactions.length} ${t.import?.success}`)
```

### Filtrar Transações Importadas
```typescript
const handleImportComplete = (importedTransactions: Transaction[]) => {
  // Filtrar apenas valores acima de R$ 10
  const filtered = importedTransactions.filter(t => t.amount > 10)
  
  // Ou modificar categorias
  const modified = importedTransactions.map(t => ({
    ...t,
    category: customCategoryLogic(t.description)
  }))
  
  setTransactions((current) => [...(current || []), ...modified])
  toast.success(`${modified.length} transações importadas!`)
}
```

## 🔍 Debugging

### Ver Transações no Console
```typescript
const handleImportComplete = (importedTransactions: Transaction[]) => {
  console.log('Transações importadas:', importedTransactions)
  setTransactions((current) => [...(current || []), ...importedTransactions])
}
```

### Verificar Parse
```typescript
// No BankFileUpload.tsx, adicione console.log no handleProcessFile:
console.log('Resultado do parse:', result)
```

## ⚡ Performance

- ✅ Arquivos até 10MB são suportados
- ✅ Parse é assíncrono (não trava a UI)
- ✅ Erros são tratados por linha (uma linha ruim não invalida o arquivo)
- ✅ Preview mostra apenas 10 transações para performance

## 📞 Problemas Comuns

### Botão não aparece
- ✅ Verificar import do Upload icon
- ✅ Verificar estado `showImportFile`
- ✅ Verificar se está no `<header>`

### Modal não abre
- ✅ Verificar `open={showImportFile}`
- ✅ Verificar `onOpenChange={setShowImportFile}`
- ✅ Verificar console para erros

### Transações não aparecem
- ✅ Verificar `handleImportComplete` está chamando `setTransactions`
- ✅ Verificar `currentMonth` está correto
- ✅ Ver console para erros

### Arquivo não é parseado
- ✅ Verificar formato do arquivo
- ✅ Verificar encoding (UTF-8)
- ✅ Testar com arquivos de exemplo primeiro

## ✨ Pronto!

Após seguir esses passos, você terá:
- ✅ Botão de importar no header
- ✅ Modal funcional de upload
- ✅ Parser inteligente de múltiplos formatos
- ✅ Categorização automática
- ✅ Feedback visual completo
- ✅ Integração com sistema existente

**Tempo estimado: 5 minutos** ⏱️
