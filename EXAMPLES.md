# Exemplos de Uso - Repository Pattern

## Exemplo 1: Componente Simples de Lista de Transações

```tsx
import { useTransactions } from '@/hooks';

function TransactionList() {
  const { transactions, loading, error } = useTransactions();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      <h2>Minhas Transações</h2>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.id}>
            {transaction.description} - R$ {transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Exemplo 2: Filtrar Transações por Tipo

```tsx
import { useTransactions } from '@/hooks';

function ExpensesList() {
  // Apenas despesas
  const { transactions, loading } = useTransactions({ type: 'expense' });

  return (
    <div>
      <h2>Despesas</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {transactions.map(t => (
            <li key={t.id}>{t.description}: R$ {t.amount}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Exemplo 3: Criar Nova Transação

```tsx
import { useState } from 'react';
import { useTransactions } from '@/hooks';

function AddTransactionForm() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const { createTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTransaction({
        description,
        amount: parseFloat(amount),
        type: 'income',
        categoryId: 1,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Limpar formulário
      setDescription('');
      setAmount('');
      
      alert('Transação criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar transação: ' + error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Valor"
      />
      <button type="submit">Adicionar</button>
    </form>
  );
}
```

## Exemplo 4: Editar Transação

```tsx
import { useTransactions } from '@/hooks';

function EditTransaction({ transactionId }: { transactionId: number }) {
  const { transactions, updateTransaction } = useTransactions();
  const transaction = transactions.find(t => t.id === transactionId);

  const handleEdit = async () => {
    await updateTransaction(transactionId, {
      amount: 150.00,
      description: 'Descrição atualizada'
    });
  };

  return (
    <div>
      <h3>{transaction?.description}</h3>
      <button onClick={handleEdit}>Editar</button>
    </div>
  );
}
```

## Exemplo 5: Deletar Transação com Confirmação

```tsx
import { useTransactions } from '@/hooks';

function TransactionWithDelete({ transactionId }: { transactionId: number }) {
  const { deleteTransaction, refresh } = useTransactions();

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(transactionId);
        alert('Transação excluída!');
      } catch (error) {
        alert('Erro ao excluir: ' + error);
      }
    }
  };

  return <button onClick={handleDelete}>Excluir</button>;
}
```

## Exemplo 6: Dashboard com Totalizadores

```tsx
import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks';

function Dashboard() {
  const { getTotalByType } = useTransactions();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    async function loadTotals() {
      const income = await getTotalByType('income');
      const expense = await getTotalByType('expense');
      setTotalIncome(income);
      setTotalExpense(expense);
    }
    loadTotals();
  }, [getTotalByType]);

  const balance = totalIncome - totalExpense;

  return (
    <div>
      <h2>Dashboard Financeiro</h2>
      <div>Receitas: R$ {totalIncome.toFixed(2)}</div>
      <div>Despesas: R$ {totalExpense.toFixed(2)}</div>
      <div>Saldo: R$ {balance.toFixed(2)}</div>
    </div>
  );
}
```

## Exemplo 7: Gerenciar Categorias

```tsx
import { useState } from 'react';
import { useCategories } from '@/hooks';

function CategoryManager() {
  const [newCategory, setNewCategory] = useState('');
  const { categories, createCategory, deleteCategory } = useCategories();

  const handleAdd = async () => {
    try {
      await createCategory({
        name: newCategory,
        type: 'expense',
        color: '#FF5733',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setNewCategory('');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <input
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="Nova categoria"
      />
      <button onClick={handleAdd}>Adicionar</button>

      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            <span style={{ color: cat.color }}>{cat.name}</span>
            <button onClick={() => deleteCategory(cat.id!)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Exemplo 8: Filtrar por Período

```tsx
import { useTransactions } from '@/hooks';

function MonthlyReport() {
  const startDate = new Date(2024, 0, 1); // Janeiro 2024
  const endDate = new Date(2024, 0, 31);   // 31 Janeiro 2024

  const { transactions } = useTransactions({
    startDate,
    endDate
  });

  return (
    <div>
      <h2>Relatório de Janeiro</h2>
      <ul>
        {transactions.map(t => (
          <li key={t.id}>{t.description} - R$ {t.amount}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Exemplo 9: Uso Direto do Repository (Casos Avançados)

```tsx
import { transactionRepository } from '@/repositories';

// Função utilitária para calcular gastos mensais
export async function calculateMonthlyExpenses(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const transactions = await transactionRepository.getByDateRange(
    startDate, 
    endDate
  );
  
  const expenses = transactions.filter(t => t.type === 'expense');
  return expenses.reduce((sum, t) => sum + t.amount, 0);
}
```

## Exemplo 10: Orçamentos Ativos

```tsx
import { useBudgets } from '@/hooks';
import { useEffect, useState } from 'react';

function ActiveBudgets() {
  const { getActiveBudgets } = useBudgets();
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    async function load() {
      const active = await getActiveBudgets();
      setBudgets(active);
    }
    load();
  }, [getActiveBudgets]);

  return (
    <div>
      <h2>Orçamentos Ativos</h2>
      <ul>
        {budgets.map(budget => (
          <li key={budget.id}>
            Categoria {budget.categoryId}: R$ {budget.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Vantagens desta Abordagem

1. **Componentes mais limpos**: Sem lógica de banco de dados nos componentes
2. **Reutilização**: Mesmos hooks em múltiplos componentes
3. **Testabilidade**: Fácil mockar hooks em testes
4. **Manutenibilidade**: Mudanças no Dexie não afetam componentes
5. **Type Safety**: TypeScript garante tipos corretos
6. **Separação de responsabilidades**: Cada camada tem seu propósito claro
