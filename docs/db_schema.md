# Schema do Banco de Dados - FinanceAI

## Visão Geral

O FinanceAI utiliza **Dexie.js** como camada de abstração sobre IndexedDB para armazenamento local no navegador. O banco de dados é chamado `financeai-db` e contém 5 tabelas principais.

## Versão do Schema

**Versão atual:** 1.0  
**Data de criação:** 21 de novembro de 2025

## Tecnologias

- **Dexie.js** v4.x - Wrapper sobre IndexedDB
- **dexie-react-hooks** - Integração reativa com React
- **TypeScript** - Type safety para todas as operações

## Estrutura das Tabelas

### 1. Transactions (Transações)

Armazena todas as transações financeiras importadas ou criadas manualmente.

```typescript
interface DBTransaction {
  id?: number;              // Auto-incremento, chave primária
  date: string;             // Data da transação (ISO 8601)
  description: string;      // Descrição da transação
  amount: number;           // Valor (positivo ou negativo)
  type: 'debit' | 'credit'; // Tipo da transação
  balance?: number;         // Saldo após transação (opcional)
  category?: string;        // Categoria da transação
  accountId?: number;       // ID da conta bancária
  createdAt: string;        // Timestamp de criação (ISO 8601)
  updatedAt: string;        // Timestamp de atualização (ISO 8601)
}
```

**Índices:**
- `id` (primary key, auto-increment)
- `date` (indexed)
- `type` (indexed)
- `category` (indexed)
- `accountId` (indexed)
- `createdAt` (indexed)

### 2. Bills (Contas a Pagar)

Armazena contas e despesas recorrentes.

```typescript
interface Bill {
  id?: number;                                 // Auto-incremento, chave primária
  name: string;                                // Nome da conta
  amount: number;                              // Valor da conta
  dueDate: string;                             // Data de vencimento (ISO 8601)
  isPaid: boolean;                             // Status de pagamento
  category?: string;                           // Categoria da conta
  recurrence?: 'once' | 'monthly' | 'yearly';  // Recorrência
  createdAt: string;                           // Timestamp de criação
  updatedAt: string;                           // Timestamp de atualização
}
```

**Índices:**
- `id` (primary key, auto-increment)
- `dueDate` (indexed)
- `isPaid` (indexed)
- `category` (indexed)
- `createdAt` (indexed)

### 3. Goals (Metas Financeiras)

Armazena metas financeiras do usuário.

```typescript
interface Goal {
  id?: number;          // Auto-incremento, chave primária
  name: string;         // Nome da meta
  targetAmount: number; // Valor alvo
  currentAmount: number;// Valor atual
  deadline?: string;    // Prazo (ISO 8601)
  category?: string;    // Categoria da meta
  createdAt: string;    // Timestamp de criação
  updatedAt: string;    // Timestamp de atualização
}
```

**Índices:**
- `id` (primary key, auto-increment)
- `deadline` (indexed)
- `createdAt` (indexed)

### 4. Categories (Categorias)

Armazena categorias customizáveis para transações e contas.

```typescript
interface Category {
  id?: number;                   // Auto-incremento, chave primária
  name: string;                  // Nome da categoria
  type: 'income' | 'expense';    // Tipo (receita ou despesa)
  color?: string;                // Cor da categoria (hex)
  icon?: string;                 // Ícone da categoria
  createdAt: string;             // Timestamp de criação
  updatedAt: string;             // Timestamp de atualização
}
```

**Índices:**
- `id` (primary key, auto-increment)
- `name` (indexed)
- `type` (indexed)
- `createdAt` (indexed)

### 5. Settings (Configurações)

Armazena configurações da aplicação como chave-valor.

```typescript
interface Settings {
  key: string;   // Chave primária (ex: 'app-language', 'theme')
  value: string; // Valor JSON stringificado
}
```

**Índices:**
- `key` (primary key)

## Repositórios (Repository Pattern)

Cada tabela possui um repositório dedicado com operações CRUD:

### transactionRepository

```typescript
- add(transaction): Promise<number>
- getAll(): Promise<DBTransaction[]>
- getById(id): Promise<DBTransaction | undefined>
- update(id, changes): Promise<number>
- delete(id): Promise<void>
- getByDateRange(startDate, endDate): Promise<DBTransaction[]>
- getByCategory(category): Promise<DBTransaction[]>
- clear(): Promise<void>
```

### billRepository

```typescript
- add(bill): Promise<number>
- getAll(): Promise<Bill[]>
- getById(id): Promise<Bill | undefined>
- update(id, changes): Promise<number>
- delete(id): Promise<void>
- getUnpaid(): Promise<Bill[]>
- clear(): Promise<void>
```

### goalRepository

```typescript
- add(goal): Promise<number>
- getAll(): Promise<Goal[]>
- getById(id): Promise<Goal | undefined>
- update(id, changes): Promise<number>
- delete(id): Promise<void>
- clear(): Promise<void>
```

### categoryRepository

```typescript
- add(category): Promise<number>
- getAll(): Promise<Category[]>
- getById(id): Promise<Category | undefined>
- getByType(type): Promise<Category[]>
- update(id, changes): Promise<number>
- delete(id): Promise<void>
- clear(): Promise<void>
```

### settingsRepository

```typescript
- set<T>(key, value): Promise<string>
- get<T>(key): Promise<T | undefined>
- delete(key): Promise<void>
- getAll(): Promise<Record<string, unknown>>
- clear(): Promise<void>
```

## Hooks React

### useTransactions

Hook reativo para gerenciar transações.

```typescript
const {
  transactions,      // Lista de transações (atualizada automaticamente)
  isLoading,        // Estado de carregamento
  error,            // Mensagem de erro
  addTransaction,   // Adicionar transação
  updateTransaction,// Atualizar transação
  deleteTransaction,// Deletar transação
  clearTransactions,// Limpar todas
  getTransactionsByDateRange,  // Buscar por período
  getTransactionsByCategory,   // Buscar por categoria
} = useTransactions();
```

### useCategories

Hook reativo para gerenciar categorias.

```typescript
const {
  categories,         // Lista de categorias
  isLoading,
  error,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
  clearCategories,
} = useCategories();
```

### useBills

Hook reativo para gerenciar contas.

```typescript
const {
  bills,              // Lista de contas
  isLoading,
  error,
  addBill,
  updateBill,
  deleteBill,
  getUnpaidBills,
} = useBills();
```

### useGoals

Hook reativo para gerenciar metas.

```typescript
const {
  goals,              // Lista de metas
  isLoading,
  error,
  addGoal,
  updateGoal,
  deleteGoal,
} = useGoals();
```

### useSettings

Hook para gerenciar configurações.

```typescript
const {
  isLoading,
  error,
  getSetting,
  setSetting,
  deleteSetting,
  getAllSettings,
} = useSettings();
```

## Setup e Inicialização

### 1. Importar o banco de dados

```typescript
import { db } from '@/lib/db';
```

### 2. Usar hooks nos componentes

```typescript
import { useTransactions } from '@/hooks';

function MyComponent() {
  const { transactions, addTransaction } = useTransactions();
  
  // transactions é atualizado automaticamente quando o DB muda
  // graças ao useLiveQuery do dexie-react-hooks
}
```

### 3. Usar repositórios diretamente (sem hooks)

```typescript
import { transactionRepository } from '@/lib/db';

async function loadData() {
  const transactions = await transactionRepository.getAll();
}
```

## Migrations e Versionamento

O Dexie gerencia migrations automaticamente usando o sistema de versionamento:

```typescript
this.version(1).stores({
  transactions: '++id, date, type, category, accountId, createdAt',
  // ...
});

// Futuras migrations:
// this.version(2).stores({...}).upgrade(tx => { ... });
```

### Como adicionar uma nova migration

1. Incrementar o número da versão
2. Definir novo schema ou alterações
3. Adicionar função `upgrade` se necessário para migrar dados existentes

Exemplo:

```typescript
this.version(2)
  .stores({
    transactions: '++id, date, type, category, accountId, createdAt, userId',
  })
  .upgrade(tx => {
    // Migração de dados se necessário
    return tx.table('transactions').toCollection().modify(transaction => {
      transaction.userId = 'default-user';
    });
  });
```

## Limitações e Considerações

### IndexedDB Limits

- **Quota:** Geralmente 50% do espaço em disco disponível (pode variar por navegador)
- **Por domínio:** Limite compartilhado entre todas as aplicações do domínio
- **Safari:** Limites mais restritivos (~1GB)

### Performance

- **Índices:** Use índices para queries frequentes (já configurados nas tabelas)
- **Bulk operations:** Use `bulkAdd`, `bulkPut` para inserir muitos registros
- **Transactions:** Operações são transacionais por padrão

### Sincronização

- Dados são **apenas locais** até implementação do Sync Engine (#6)
- Para sync com nuvem, ver `docs/ISSUE_41_SYNC_ENGINE_PLAN.md`

## Testes

Para testar o banco de dados:

```typescript
// Adicionar dados de teste
await transactionRepository.add({
  date: new Date().toISOString(),
  description: 'Teste',
  amount: 100,
  type: 'credit',
});

// Verificar no DevTools
// Application > IndexedDB > financeai-db
```

## Referências

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [dexie-react-hooks](https://github.com/dexie/Dexie.js/tree/master/addons/dexie-react-hooks)

---

**Última atualização:** 21 de novembro de 2025  
**Versão do schema:** 1.0  
**Status:** ✅ Implementado
