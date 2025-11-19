# FinanceAI

Aplicativo de gestão financeira com importação de extratos bancários (OFX/CSV).

## 🚀 Funcionalidades

- ✅ Importação de arquivos OFX (Open Financial Exchange)
- ✅ Importação de arquivos CSV (Comma-Separated Values)
- ✅ Detecção automática de formato de arquivo
- ✅ Análise inteligente de colunas CSV
- ✅ Interface drag-and-drop para upload
- ✅ Visualização de transações importadas
- ✅ Suporte para múltiplos formatos de data e valor

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🔧 Instalação

```bash
# Clonar o repositório
git clone https://github.com/fabioaap/FinanceAI.git
cd FinanceAI

# Instalar dependências
npm install
```

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse em: http://localhost:5173

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
FinanceAI/
├── src/
│   ├── components/
│   │   └── FileUpload.tsx      # Componente de upload de arquivos
│   ├── parsers/
│   │   ├── index.ts            # Factory de parsers
│   │   ├── ofxParser.ts        # Parser OFX
│   │   └── csvParser.ts        # Parser CSV
│   ├── types/
│   │   ├── transaction.ts      # Tipos TypeScript
│   │   └── ofx.d.ts           # Declarações de tipo OFX
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais
├── examples/
│   ├── example.csv            # Exemplo de arquivo CSV
│   └── example.ofx            # Exemplo de arquivo OFX
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 📝 Uso

### Importando Arquivos

1. Acesse a aplicação no navegador
2. Arraste um arquivo OFX ou CSV para a área de upload, ou clique para selecionar
3. Clique em "Importar" para processar o arquivo
4. Visualize as transações importadas na tabela

### Formato CSV Suportado

O parser CSV detecta automaticamente colunas com os seguintes nomes (case-insensitive):

- **Data**: `data`, `date`, `dt`
- **Valor**: `valor`, `amount`, `value`, `quantia`
- **Descrição**: `descrição`, `descricao`, `description`, `historico`, `histórico`
- **Tipo**: `tipo`, `type`, `natureza` (opcional)
- **Saldo**: `saldo`, `balance` (opcional)
- **Categoria**: `categoria`, `category` (opcional)

Exemplo de CSV válido:

```csv
Data,Descrição,Valor,Tipo
15/11/2024,Supermercado XYZ,-150.50,Débito
16/11/2024,Salário,5000.00,Crédito
```

### Formato OFX Suportado

O parser suporta arquivos OFX padrão (versão 1.x e 2.x) com transações bancárias.

Veja o arquivo `examples/example.ofx` para um exemplo completo.

## 🧪 Testando com Arquivos de Exemplo

Arquivos de exemplo estão disponíveis na pasta `examples/`:

- `example.csv` - Arquivo CSV de exemplo
- `example.ofx` - Arquivo OFX de exemplo

Use esses arquivos para testar a funcionalidade de importação.

## 🛠️ Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilo
- **PapaParse** - Parser CSV
- **ofx** - Parser OFX

## 📦 Dependências Principais

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "papaparse": "^5.5.3",
  "ofx": "^0.5.0",
  "tailwindcss": "^4.1.17"
}
```

## 🔒 Segurança

- Processamento de arquivos totalmente no cliente (browser)
- Nenhum dado é enviado para servidores externos
- Validação de formato de arquivo antes do processamento

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

ISC

## ✨ Próximas Funcionalidades

- [ ] Categorização automática de transações
- [ ] Exportação para diferentes formatos
- [ ] Gráficos e relatórios financeiros
- [ ] Integração com bancos via API
- [ ] Persistência local de dados
- [ ] Suporte a múltiplas contas

## 📧 Contato

FABIO ALVES - fabiovisualmidia@gmail.com

Link do Projeto: [https://github.com/fabioaap/FinanceAI](https://github.com/fabioaap/FinanceAI)