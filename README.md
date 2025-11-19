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

- **[REPOSITORY_PATTERN.md](./REPOSITORY_PATTERN.md)**: Guia completo sobre a implementação do Repository Pattern
- **[EXAMPLES.md](./EXAMPLES.md)**: 10+ exemplos práticos de uso dos hooks e repositories
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitetura detalhada do sistema, fluxos de dados e boas práticas

## 🏗️ Estrutura do Projeto

```
src/
├── database/       # Configuração Dexie
│   └── db.ts       # Schema e inicialização do banco
├── repositories/   # Camada de acesso a dados (Repository Pattern)
│   ├── BaseRepository.ts           # CRUD genérico
│   ├── TransactionRepository.ts    # Lógica de transações
│   ├── CategoryRepository.ts       # Lógica de categorias
│   ├── BudgetRepository.ts         # Lógica de orçamentos
│   └── AccountRepository.ts        # Lógica de contas
├── hooks/          # Custom React Hooks
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useBudgets.ts
│   └── useAccounts.ts
├── types/          # Definições TypeScript
│   └── index.ts    # Interfaces das entidades
└── test/           # Setup de testes
    └── setup.ts    # Configuração vitest + fake-indexeddb
```

## 💡 Exemplo de Uso Rápido

```tsx
import { useTransactions } from '@/hooks';

function MyComponent() {
  const { 
    transactions, 
    createTransaction, 
    deleteTransaction,
    loading,
    error 
  } = useTransactions();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <div>
      {transactions.map(t => (
        <div key={t.id}>
          {t.description} - R$ {t.amount}
          <button onClick={() => deleteTransaction(t.id!)}>
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}
```

Veja mais exemplos em [EXAMPLES.md](./EXAMPLES.md).

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch
```

Cobertura de testes:
- ✅ Repositories com operações CRUD
- ✅ Filtros e queries específicas
- ✅ Cálculos e agregações
- ✅ Validações de dados

## 🎯 Principais Conceitos

### Repository Pattern
Isola completamente a lógica do Dexie dos componentes React, fornecendo:
- Interface consistente para CRUD
- Reutilização de código
- Facilidade de teste (mocking)
- Manutenibilidade

### Custom Hooks
Encapsulam estado e efeitos, oferecendo:
- Estado de loading/error automático
- Atualização reativa dos dados
- API simples e intuitiva
- Reutilização entre componentes

## 🔧 Extensibilidade

Para adicionar novas entidades ao sistema:

1. Defina o tipo em `src/types/index.ts`
2. Adicione a tabela em `src/database/db.ts`
3. Crie o repository em `src/repositories/`
4. Crie o hook em `src/hooks/`

Veja guia completo em [ARCHITECTURE.md](./ARCHITECTURE.md#extensibilidade).

## 📊 Entidades Disponíveis

- **Transactions**: Receitas e despesas
- **Categories**: Categorias de transações
- **Budgets**: Orçamentos por categoria
- **Accounts**: Contas bancárias e carteiras

## 🚀 CI/CD

GitHub Actions configurado para executar:
- Linting (ESLint)
- Testes (Vitest)
- Build (TypeScript + Vite)

## 📝 Licença

ISC

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📚 Recursos Adicionais

- [Dexie.js Documentation](https://dexie.org/)
- [React Hooks Guide](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)