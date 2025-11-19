# Hooks Usage Examples

This document provides examples of how to use the custom hooks created for FinanceAI.

## useTransactions Hook

The `useTransactions` hook provides a complete interface to manage financial transactions using the Dexie database.

### Basic Usage

```typescript
import { useTransactions } from '@/hooks/useTransactions';

function TransactionList() {
  const { 
    transactions, 
    loading, 
    error, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    getByType,
    getByCategory,
    refetch 
  } = useTransactions();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>All Transactions</h2>
      {transactions.map(transaction => (
        <div key={transaction.id}>
          {transaction.description}: ${transaction.amount}
        </div>
      ))}
    </div>
  );
}
```

### Adding a Transaction

```typescript
import { useTransactions } from '@/hooks/useTransactions';

function AddTransactionForm() {
  const { addTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const id = await addTransaction({
        amount: 50.00,
        description: 'Coffee',
        category: 'food',
        date: new Date(),
        type: 'expense'
      });
      console.log('Transaction added with ID:', id);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Add Transaction</button>
    </form>
  );
}
```

### Filtering Transactions

```typescript
import { useTransactions } from '@/hooks/useTransactions';

function ExpensesList() {
  const { transactions, getByType } = useTransactions();

  // Get only expense transactions
  const expenses = getByType('expense');
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <h2>Expenses</h2>
      <p>Total: ${totalExpenses.toFixed(2)}</p>
      {expenses.map(expense => (
        <div key={expense.id}>{expense.description}: ${expense.amount}</div>
      ))}
    </div>
  );
}
```

### Updating a Transaction

```typescript
import { useTransactions } from '@/hooks/useTransactions';

function EditTransaction({ transactionId }: { transactionId: number }) {
  const { updateTransaction } = useTransactions();

  const handleUpdate = async () => {
    try {
      await updateTransaction(transactionId, {
        amount: 75.00,
        description: 'Updated Coffee Purchase'
      });
      console.log('Transaction updated successfully');
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  return <button onClick={handleUpdate}>Update Transaction</button>;
}
```

### Deleting a Transaction

```typescript
import { useTransactions } from '@/hooks/useTransactions';

function DeleteTransactionButton({ transactionId }: { transactionId: number }) {
  const { deleteTransaction } = useTransactions();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId);
        console.log('Transaction deleted successfully');
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## useCategories Hook

The `useCategories` hook provides category-based analysis and statistics for transactions.

### Basic Usage

```typescript
import { useCategories } from '@/hooks/useCategories';

function CategoryBreakdown() {
  const { categories, totalExpenses, loading } = useCategories();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Category Breakdown</h2>
      <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
      {categories.map(category => (
        <div key={category.category}>
          <h3>{category.name}</h3>
          <p>Amount: ${category.totalAmount.toFixed(2)}</p>
          <p>Transactions: {category.transactionCount}</p>
          <p>Percentage: {category.percentage.toFixed(1)}%</p>
        </div>
      ))}
    </div>
  );
}
```

### Category Chart

```typescript
import { useCategories } from '@/hooks/useCategories';

function CategoryChart() {
  const { categories } = useCategories();

  return (
    <div>
      <h2>Spending by Category</h2>
      {categories.map(category => (
        <div 
          key={category.category}
          style={{ 
            backgroundColor: category.color,
            width: `${category.percentage}%`,
            padding: '10px'
          }}
        >
          {category.name}: ${category.totalAmount.toFixed(2)}
        </div>
      ))}
    </div>
  );
}
```

### Get Specific Category

```typescript
import { useCategories } from '@/hooks/useCategories';

function FoodExpenses() {
  const { getCategoryByType } = useCategories();

  const foodCategory = getCategoryByType('food');

  if (!foodCategory) {
    return <div>No food expenses yet</div>;
  }

  return (
    <div>
      <h2>Food Expenses</h2>
      <p>Total: ${foodCategory.totalAmount.toFixed(2)}</p>
      <p>Transactions: {foodCategory.transactionCount}</p>
      <p>Percentage of total: {foodCategory.percentage.toFixed(1)}%</p>
    </div>
  );
}
```

## Combined Usage

You can use both hooks together for comprehensive transaction management:

```typescript
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

function Dashboard() {
  const { 
    transactions, 
    loading: transactionsLoading,
    addTransaction,
    getByType 
  } = useTransactions();
  
  const { 
    categories, 
    totalExpenses,
    loading: categoriesLoading 
  } = useCategories();

  if (transactionsLoading || categoriesLoading) {
    return <div>Loading dashboard...</div>;
  }

  const income = getByType('income');
  const expenses = getByType('expense');
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div>
      <h1>Financial Dashboard</h1>
      
      <div className="summary">
        <div>Income: ${totalIncome.toFixed(2)}</div>
        <div>Expenses: ${totalExpenses.toFixed(2)}</div>
        <div>Balance: ${balance.toFixed(2)}</div>
      </div>

      <div className="categories">
        <h2>Top Categories</h2>
        {categories.slice(0, 5).map(cat => (
          <div key={cat.category}>
            {cat.name}: ${cat.totalAmount.toFixed(2)}
          </div>
        ))}
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        {transactions.slice(0, 10).map(transaction => (
          <div key={transaction.id}>
            {transaction.description}: ${transaction.amount}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Notes

- Both hooks use the Dexie database (`@financeai/infra-db`) for data persistence
- The `useCategories` hook internally uses `useTransactions`, so changes to transactions will automatically update category statistics
- All database operations are asynchronous and return Promises
- Error handling is built into the hooks and can be accessed via the `error` property
- The `loading` state indicates when data is being fetched from the database
- Use the `refetch` function from `useTransactions` to manually refresh data if needed
