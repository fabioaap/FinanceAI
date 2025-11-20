# Finance AI - Importação de Extratos Bancários

Aplicação web para importação e visualização de extratos bancários nos formatos OFX e CSV.

## 🚀 Funcionalidades

- **Upload de Arquivos**: Interface drag-and-drop para upload de arquivos
- **Suporte a Múltiplos Formatos**:
  - PDF (Portable Document Format) - Extratos bancários em PDF
  - OFX (Open Financial Exchange)
  - CSV (Comma-Separated Values)
- **Visualização de Transações**: Tabela interativa com todas as transações importadas
- **Resumo Financeiro**: Totalizadores de créditos, débitos e saldo líquido
- **Informações da Conta**: Exibição de dados bancários quando disponíveis

## 🛠️ Stack Tecnológica

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **pdf.js** - Parser PDF (pdfjs-dist)
- **fast-xml-parser** - Parser OFX
- **PapaParse** - Parser CSV
- **ESLint** - Linting

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior

## 🔧 Instalação e Uso Local

### 1. Clone o repositório

```bash
git clone https://github.com/fabioaap/FinanceAI.git
cd FinanceAI
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### 4. Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

### 5. Preview do build de produção

```bash
npm run preview
```

## 🧪 Testes e Qualidade de Código

### Executar linter

```bash
npm run lint
```

### Executar testes

```bash
npm test
```

### Arquivos de Exemplo

Na pasta `examples/` você encontrará arquivos de exemplo para testar a aplicação:
- `exemplo.csv` - Arquivo CSV com transações de exemplo
- `exemplo.ofx` - Arquivo OFX com transações de exemplo

Use estes arquivos para testar a funcionalidade de importação.

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila TypeScript e gera build de produção |
| `npm run lint` | Executa ESLint para verificar código |
| `npm run preview` | Preview do build de produção |
| `npm test` | Executa testes (a implementar) |

## 🎯 Como Usar

1. Acesse a aplicação
2. Arraste um arquivo PDF, OFX ou CSV para a área de upload, ou clique para selecionar
3. Aguarde o processamento do arquivo
4. Visualize as transações importadas na tabela
5. Confira os totalizadores e informações da conta

## 📄 Formatos de Arquivo Suportados

### PDF (Portable Document Format)

Extrai transações de extratos bancários em formato PDF. O parser suporta:
- Extração automática de texto de PDFs
- Detecção de padrões de data, descrição e valor
- Identificação automática de débitos e créditos
- Suporte para PDFs de texto (não funciona com PDFs escaneados/imagem)
- Detecção automática de informações bancárias

**Formato esperado no PDF:**
- Linhas contendo: DATA DESCRIÇÃO VALOR
- Exemplo: `15/01/2024 COMPRA MERCADO 150,00`
- Formatos de data suportados: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD

**Limitações:**
- PDFs protegidos ou com senha não são suportados
- PDFs escaneados (apenas imagem) não são suportados - necessário OCR
- Formatos proprietários muito específicos podem não ser reconhecidos

### OFX (Open Financial Exchange)

Formato padrão usado por muitos bancos brasileiros. O parser suporta:
- Transações bancárias (BANKMSGSRSV1)
- Transações de cartão de crédito (CREDITCARDMSGSRSV1)
- Extração de informações da conta (número, banco, moeda)

### CSV (Comma-Separated Values)

O parser detecta automaticamente colunas comuns:
- **Data**: data, date, dt_transacao, dt_lancamento
- **Descrição**: descricao, description, desc, historico, memo
- **Valor**: valor, amount, vlr, value
- **Tipo**: tipo, type, dc, natureza (opcional)

Formatos de data suportados:
- DD/MM/YYYY
- DD-MM-YYYY
- YYYY-MM-DD

## 🔄 CI/CD

O projeto utiliza GitHub Actions para integração contínua:

- **Lint**: Verificação de qualidade de código
- **Test**: Execução de testes automatizados
- **Build**: Compilação e geração de artefatos

Os workflows são executados automaticamente em:
- Push para branch `main`
- Pull requests para branch `main`

## 📂 Estrutura do Projeto

```
FinanceAI/
├── .github/
│   └── workflows/
│       └── ci.yml           # Configuração GitHub Actions
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx    # Componente de upload
│   │   └── TransactionList.tsx # Lista de transações
│   ├── parsers/
│   │   ├── ofxParser.ts        # Parser OFX
│   │   └── csvParser.ts        # Parser CSV
│   ├── types/
│   │   └── index.ts            # Definições TypeScript
│   ├── utils/
│   │   └── helpers.ts          # Funções auxiliares
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais
├── dist/                      # Build de produção (gerado)
├── node_modules/              # Dependências (gerado)
├── index.html                 # HTML principal
├── package.json               # Configuração npm
├── tsconfig.json             # Configuração TypeScript
├── vite.config.ts            # Configuração Vite
├── tailwind.config.js        # Configuração Tailwind
├── postcss.config.js         # Configuração PostCSS
├── eslint.config.js          # Configuração ESLint
└── README.md                 # Este arquivo
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

ISC

## 🐛 Troubleshooting

### Erro ao importar arquivo PDF

- **PDF protegido ou com senha**: Remova a proteção antes de importar
- **PDF escaneado (apenas imagem)**: O parser atual não suporta OCR. Use um conversor online para extrair o texto ou utilize o formato OFX/CSV do seu banco
- **Formato não reconhecido**: Alguns bancos usam formatos proprietários. Tente exportar em OFX ou CSV
- **Erro de worker**: Se aparecer erro relacionado a `pdf.worker.min.js`, verifique se o arquivo está em `/libs/pdf.worker.min.js` (copiar durante build)

### Erro ao importar arquivo OFX

- Verifique se o arquivo está no formato OFX válido
- Alguns bancos exportam em formato proprietário - tente exportar novamente

### Erro ao importar arquivo CSV

- Certifique-se que o arquivo tem cabeçalhos
- Verifique se as colunas de data, descrição e valor estão presentes
- O parser suporta nomes de colunas em português e inglês

### Erro de build

```bash
# Limpe cache e reinstale dependências
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no GitHub.