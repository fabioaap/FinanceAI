# Finance AI

Aplicação de gestão financeira pessoal com React, TypeScript, Dexie (IndexedDB) e Repository Pattern.

## 🚀 Características

- **Repository Pattern**: Camada de abstração de dados isolando Dexie dos componentes React
- **React Hooks**: Custom hooks para acesso simplificado aos dados
- **TypeScript**: Tipagem forte para melhor DX e menos erros
- **Dexie**: IndexedDB wrapper para armazenamento local persistente
- **Vite**: Build tool rápida e moderna
- **Tailwind CSS**: Estilização utility-first
- **Vitest**: Testes unitários rápidos

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar testes
npm test

# Lint
npm run lint
```

## 📖 Documentação

Para detalhes sobre a arquitetura e uso do Repository Pattern, consulte [REPOSITORY_PATTERN.md](./REPOSITORY_PATTERN.md).

## 🏗️ Estrutura do Projeto

```
src/
├── database/       # Configuração Dexie
├── repositories/   # Camada de acesso a dados (Repository Pattern)
├── hooks/          # Custom React Hooks
├── types/          # Definições TypeScript
└── test/           # Setup de testes
```

## 💡 Exemplo de Uso

```tsx
import { useTransactions } from '@/hooks';

function MyComponent() {
  const { transactions, createTransaction, loading } = useTransactions();
  
  // Seu código aqui
}
```

Veja mais exemplos na documentação completa.