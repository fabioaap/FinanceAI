# Repository Pattern - Data Abstraction Layer

## Visão Geral

Esta implementação fornece uma camada de abstração de dados usando o **Repository Pattern** que isola completamente a lógica do Dexie (IndexedDB) dos componentes React.

## Arquitetura

```
src/
├── database/
│   └── db.ts                    # Configuração do Dexie
├── types/
│   └── index.ts                 # Definições de tipos TypeScript
├── repositories/
│   ├── BaseRepository.ts        # Classe base para repositórios
│   ├── TransactionRepository.ts # Repositório de transações
│   ├── CategoryRepository.ts    # Repositório de categorias
│   ├── BudgetRepository.ts      # Repositório de orçamentos
│   └── AccountRepository.ts     # Repositório de contas
├── hooks/
│   ├── useTransactions.ts       # Hook React para transações
│   ├── useCategories.ts         # Hook React para categorias
│   ├── useBudgets.ts            # Hook React para orçamentos
│   └── useAccounts.ts           # Hook React para contas
└── App.tsx                      # Exemplo de uso
```

## Conceitos Principais

### 1. Repository Pattern

O Repository Pattern abstrai a camada de acesso a dados, fornecendo uma interface consistente para operações CRUD (Create, Read, Update, Delete). Os benefícios incluem:

- **Desacoplamento**: Componentes React não conhecem os detalhes do Dexie
- **Testabilidade**: Fácil de mockar repositórios em testes
- **Manutenibilidade**: Mudanças na camada de dados não afetam componentes
- **Reutilização**: Mesma lógica pode ser usada em múltiplos componentes

### 2. Hooks React

Custom hooks encapsulam a lógica de estado e efeitos, fornecendo uma API simples para componentes:

- Gerenciamento automático de estado (loading, error, data)
- Atualização automática quando dados mudam
- Funções CRUD prontas para uso
- Integração perfeita com ciclo de vida React

## Uso

### Exemplo: Gerenciar Transações

```tsx
import { useTransactions } from '@/hooks';

function TransactionList() {
  const { 
    transactions, 
    loading, 
    error, 
    createTransaction, 
    deleteTransaction 
  } = useTransactions();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  const handleCreate = async () => {
    await createTransaction({
      description: 'Salário',
      amount: 5000,
      type: 'income',
      categoryId: 1,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Adicionar Transação</button>
      {transactions.map(t => (
        <div key={t.id}>
          {t.description} - R$ {t.amount}
          <button onClick={() => deleteTransaction(t.id!)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}
```

### Exemplo: Filtrar Transações

```tsx
import { useTransactions } from '@/hooks';

function ExpenseList() {
  // Filtrar apenas despesas
  const { transactions } = useTransactions({ type: 'expense' });

  return (
    <div>
      {transactions.map(t => (
        <div key={t.id}>{t.description}</div>
      ))}
    </div>
  );
}
```

### Exemplo: Gerenciar Categorias

```tsx
import { useCategories } from '@/hooks';

function CategoryManager() {
  const { categories, createCategory, updateCategory } = useCategories();

  const handleCreate = async () => {
    try {
      await createCategory({
        name: 'Alimentação',
        type: 'expense',
        color: '#FF5733',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>Adicionar Categoria</button>
      {categories.map(c => (
        <div key={c.id} style={{ color: c.color }}>
          {c.name}
        </div>
      ))}
    </div>
  );
}
```

### Exemplo: Usar Repositórios Diretamente (Casos Avançados)

```tsx
import { transactionRepository } from '@/repositories';

// Calcular total de receitas no último mês
async function calculateMonthlyIncome() {
  const startDate = new Date();
  startDate.setDate(1); // Primeiro dia do mês
  
  const endDate = new Date();
  
  const total = await transactionRepository.getTotalByType(
    'income', 
    startDate, 
    endDate
  );
  
  return total;
}
```

## API dos Hooks

### useTransactions(filters?)

**Parâmetros:**
- `filters` (opcional): Objeto com filtros para transações
  - `type`: 'income' | 'expense'
  - `categoryId`: number
  - `startDate`: Date
  - `endDate`: Date

**Retorna:**
- `transactions`: Array de transações
- `loading`: boolean
- `error`: Error | null
- `createTransaction(transaction)`: Promise
- `updateTransaction(id, data)`: Promise
- `deleteTransaction(id)`: Promise
- `getTotalByType(type, startDate?, endDate?)`: Promise<number>
- `refresh()`: Promise - Recarrega dados

### useCategories(type?)

**Parâmetros:**
- `type` (opcional): 'income' | 'expense'

**Retorna:**
- `categories`: Array de categorias
- `loading`: boolean
- `error`: Error | null
- `createCategory(category)`: Promise
- `updateCategory(id, data)`: Promise
- `deleteCategory(id)`: Promise
- `refresh()`: Promise

### useBudgets(categoryId?)

**Parâmetros:**
- `categoryId` (opcional): number

**Retorna:**
- `budgets`: Array de orçamentos
- `loading`: boolean
- `error`: Error | null
- `createBudget(budget)`: Promise
- `updateBudget(id, data)`: Promise
- `deleteBudget(id)`: Promise
- `getActiveBudgets(date?)`: Promise<Budget[]>
- `refresh()`: Promise

### useAccounts(type?)

**Parâmetros:**
- `type` (opcional): 'checking' | 'savings' | 'credit' | 'investment'

**Retorna:**
- `accounts`: Array de contas
- `loading`: boolean
- `error`: Error | null
- `createAccount(account)`: Promise
- `updateAccount(id, data)`: Promise
- `deleteAccount(id)`: Promise
- `getTotalBalance(accountType?)`: Promise<number>
- `updateBalance(id, newBalance)`: Promise
- `refresh()`: Promise

## Testes

Os repositórios incluem testes unitários que validam:

- Operações CRUD básicas
- Filtros e consultas específicas
- Cálculos e agregações
- Validações de dados

Execute os testes:

```bash
npm test
```

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Lint
npm run lint

# Testes
npm test

# Testes em modo watch
npm run test:watch

# Preview da build
npm run preview
```

## Estrutura de Dados

### Transaction
```typescript
interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category
```typescript
interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Budget
```typescript
interface Budget {
  id?: number;
  categoryId: number;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Account
```typescript
interface Account {
  id?: number;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Boas Práticas

1. **Use hooks nos componentes**: Sempre prefira usar os hooks ao invés de acessar repositórios diretamente
2. **Trate erros**: Os hooks podem lançar erros, sempre use try/catch
3. **Otimize re-renderizações**: Use React.memo e useCallback quando necessário
4. **Valide dados**: Valide dados antes de criar/atualizar
5. **Timestamps automáticos**: Os repositórios gerenciam createdAt/updatedAt automaticamente

## Próximos Passos

Para estender a funcionalidade:

1. Adicionar mais métodos específicos aos repositórios
2. Criar hooks compostos para casos de uso complexos
3. Implementar cache e otimizações de performance
4. Adicionar sincronização com backend
5. Implementarundo/redo de operações
