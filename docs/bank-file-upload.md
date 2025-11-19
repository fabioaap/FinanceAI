# Parser e Interface de Upload de Arquivos Bancários

## 📋 Visão Geral

Sistema completo para importação de extratos bancários em múltiplos formatos, com parser inteligente e interface drag-and-drop.

## 🚀 Recursos

### Formatos Suportados

- **CSV** - Arquivos de valores separados por vírgula/ponto-e-vírgula
- **OFX** - Open Financial Exchange (formato padrão bancário)
- **TXT** - Arquivos de texto com padrões comuns

### Funcionalidades

✅ Detecção automática de formato  
✅ Suporte a múltiplos formatos de data (dd/mm/yyyy, yyyy-mm-dd)  
✅ Parse de valores brasileiros (1.234,56) e americanos (1,234.56)  
✅ Categorização automática baseada em descrição  
✅ Interface drag-and-drop intuitiva  
✅ Validação de tamanho de arquivo  
✅ Preview de transações antes da importação  
✅ Integração com banco de dados Dexie  

## 📦 Arquivos Criados

```
src/
├── lib/
│   ├── types.ts                    # Tipos atualizados
│   └── bank-file-parser.ts         # Parser principal
├── components/
│   ├── BankFileUpload.tsx          # Componente de upload
│   └── modals/
│       └── ImportBankFileModal.tsx # Modal de importação
└── docs/
    └── bank-file-upload.md         # Esta documentação
```

## 🔧 Como Usar

### 1. Importar o Modal

```tsx
import { ImportBankFileModal } from '@/components/modals/ImportBankFileModal'
import { useState } from 'react'

function App() {
  const [showImport, setShowImport] = useState(false)
  
  const handleImportComplete = () => {
    // Recarregar transações ou atualizar UI
    console.log('Importação concluída!')
  }

  return (
    <>
      <Button onClick={() => setShowImport(true)}>
        Importar Extrato
      </Button>
      
      <ImportBankFileModal
        open={showImport}
        onOpenChange={setShowImport}
        onImportComplete={handleImportComplete}
      />
    </>
  )
}
```

### 2. Usar o Parser Diretamente

```tsx
import { parseBankFile } from '@/lib/bank-file-parser'

async function handleFileUpload(file: File) {
  const result = await parseBankFile(file)
  
  if (result.success) {
    console.log(`${result.totalParsed} transações encontradas`)
    console.log(result.transactions)
  } else {
    console.error('Erros:', result.errors)
  }
}
```

## 📄 Formatos de Arquivo

### CSV - Formato 1: Data, Descrição, Valor

```csv
Data,Descrição,Valor
01/11/2025,Supermercado XYZ,-150.50
05/11/2025,Salário,+5000.00
10/11/2025,Restaurante ABC,-85.30
```

### CSV - Formato 2: Data, Descrição, Débito, Crédito

```csv
Data,Descrição,Débito,Crédito
01/11/2025,Compra Loja,150.50,0.00
05/11/2025,Depósito,0.00,5000.00
10/11/2025,Pagamento Conta,85.30,0.00
```

### OFX - Open Financial Exchange

```xml
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20251101</DTPOSTED>
            <TRNAMT>-150.50</TRNAMT>
            <MEMO>Supermercado XYZ</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
```

### TXT - Formato Livre

```
01/11/2025 Supermercado XYZ R$ -150,50
05/11/2025 Salário R$ 5.000,00
10/11/2025 Restaurante ABC -85,30
```

## 🤖 Categorização Automática

O parser sugere automaticamente categorias baseadas em palavras-chave:

| Categoria | Palavras-chave |
|-----------|---------------|
| **food** | mercado, supermercado, restaurante, ifood, delivery |
| **transport** | uber, taxi, transporte, combustível, gasolina |
| **shopping** | shopping, loja, magazine, compra |
| **health** | farmácia, consulta, médico, hospital, clínica |
| **home** | aluguel, condomínio, energia, água, internet |
| **entertainment** | cinema, netflix, spotify, show, evento |
| **education** | escola, curso, faculdade, livro |
| **work** | salário, pagamento, freelance |

## 🎨 Interface de Usuário

### Componente BankFileUpload

- **Drag and Drop**: Arraste arquivos diretamente
- **Click to Upload**: Clique para abrir seletor de arquivos
- **Preview**: Visualize até 10 transações antes de importar
- **Validação**: Tamanho máximo de 10MB
- **Feedback**: Indicadores visuais de progresso e resultado

### Modal ImportBankFileModal

- **Integração Automática**: Salva transações no Dexie
- **Relatório de Importação**: Mostra sucessos e falhas
- **Tratamento de Erros**: Lista erros específicos
- **Callback**: Notifica quando importação é concluída

## 🔍 Detecção de Formato

O parser detecta automaticamente o formato baseado em:

1. **Extensão do arquivo** (.csv, .ofx, .txt)
2. **Conteúdo do arquivo**:
   - OFX: Presença de tags `<OFX>` ou `OFXHEADER`
   - CSV: Presença de separadores `,` ou `;`
   - TXT: Formato livre com padrões de data/valor

## ⚙️ Configuração

### Limites e Validações

```typescript
const config = {
  acceptedFormats: ['csv', 'ofx', 'txt'],
  maxFileSizeMB: 10,
  autoDetectFormat: true
}
```

### Personalizar Categorização

Edite o método `suggestCategory` em `bank-file-parser.ts`:

```typescript
private suggestCategory(description: string): CategoryType {
  const desc = description.toLowerCase()
  
  // Adicione suas próprias regras
  if (desc.includes('sua-palavra-chave')) {
    return 'sua-categoria'
  }
  
  // ... resto da lógica
}
```

## 🧪 Testes

### Testar o Parser

```typescript
import { BankFileParser } from '@/lib/bank-file-parser'

const testCSV = `Data,Descrição,Valor
01/11/2025,Teste,-100.00`

const blob = new Blob([testCSV], { type: 'text/csv' })
const file = new File([blob], 'test.csv', { type: 'text/csv' })

const parser = new BankFileParser(file)
const result = await parser.parse(file)

console.log(result)
```

## 🐛 Tratamento de Erros

O parser lida com:

- ✅ Arquivos vazios
- ✅ Formatos de data inválidos
- ✅ Valores monetários malformados
- ✅ Linhas incompletas
- ✅ Caracteres especiais
- ✅ Diferentes encodings

Erros não fatais são registrados mas não impedem o processamento das linhas válidas.

## 📊 Exemplos de Uso

### Exemplo 1: Integração no Dashboard

```tsx
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportBankFileModal } from '@/components/modals/ImportBankFileModal'

function Dashboard() {
  const [showImport, setShowImport] = useState(false)
  const { reload } = useTransactions()

  return (
    <div>
      <Button onClick={() => setShowImport(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Importar Extrato
      </Button>

      <ImportBankFileModal
        open={showImport}
        onOpenChange={setShowImport}
        onImportComplete={reload}
      />
    </div>
  )
}
```

### Exemplo 2: Validação Customizada

```tsx
import { BankFileUpload } from '@/components/BankFileUpload'

function CustomUpload() {
  const handleParsed = (transactions) => {
    // Filtrar transações antes de importar
    const filtered = transactions.filter(t => t.amount > 10)
    
    // Modificar categorias
    const modified = filtered.map(t => ({
      ...t,
      category: customCategoryLogic(t.description)
    }))
    
    // Importar
    importTransactions(modified)
  }

  return <BankFileUpload onTransactionsParsed={handleParsed} />
}
```

## 🚀 Próximos Passos

- [ ] Adicionar suporte para QIF (Quicken Interchange Format)
- [ ] Implementar mapeamento de categorias customizável
- [ ] Adicionar detecção de transações duplicadas
- [ ] Suporte para múltiplos arquivos simultâneos
- [ ] Exportação de transações para diferentes formatos
- [ ] Machine learning para melhor categorização

## 📝 Notas

- O parser é tolerante a erros e continua processando mesmo com linhas inválidas
- Transações são categorizadas automaticamente, mas podem ser editadas depois
- Valores são sempre armazenados como positivos, com o tipo indicando receita/despesa
- Datas são convertidas para formato ISO (YYYY-MM-DD) para consistência

## 🤝 Contribuindo

Para adicionar suporte a novos formatos:

1. Adicione o tipo em `BankFileFormat`
2. Implemente método `parseXXX()` no parser
3. Atualize `detectFormat()` para reconhecer o novo formato
4. Adicione testes e documentação
