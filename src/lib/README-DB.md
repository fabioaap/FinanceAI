# Dexie Database Configuration

This directory contains the Dexie database configuration for FinanceAI.

## Files

- **db.ts**: Main database configuration with schema definitions
- **db-operations.ts**: Helper functions for common database operations
- **types.ts**: TypeScript type definitions for database entities

## Database Schema

### Tables

#### 1. Transactions
Stores all financial transactions (income and expenses)
- `id` (string, primary key)
- `amount` (number)
- `description` (string)
- `category` (CategoryType)
- `type` (TransactionType: 'income' | 'expense')
- `date` (string, ISO format)
- `createdAt` (string, ISO format)

#### 2. Bills
Tracks bills and recurring payments
- `id` (string, primary key)
- `description` (string)
- `amount` (number)
- `dueDate` (string, ISO format)
- `status` ('pending' | 'paid' | 'overdue')
- `recurrence` ('once' | 'weekly' | 'monthly' | 'yearly', optional)
- `createdAt` (string, ISO format)

#### 3. Goals
Manages savings and financial goals
- `id` (string, primary key)
- `description` (string)
- `targetAmount` (number)
- `currentAmount` (number)
- `deadline` (string, ISO format)
- `type` ('savings' | 'debt' | 'reserve')
- `createdAt` (string, ISO format)

#### 4. Categories
Stores category metadata for transactions
- `id` (number, auto-increment primary key)
- `name` (string)
- `icon` (string)
- `color` (string)
- `type` ('income' | 'expense')

## Usage

### Import the database

```typescript
import { db } from '@/lib/db'
```

### Using helper functions

```typescript
import { addTransaction, getAllTransactions, seedCategories } from '@/lib/db-operations'

// Seed default categories
await seedCategories()

// Add a transaction
await addTransaction({
  id: 'tx-001',
  amount: 100,
  description: 'Groceries',
  category: 'food',
  type: 'expense',
  date: new Date().toISOString(),
  createdAt: new Date().toISOString()
})

// Get all transactions
const transactions = await getAllTransactions()
```

### Direct Dexie operations

```typescript
import { db } from '@/lib/db'

// Query transactions by date
const recentTransactions = await db.transactions
  .where('date')
  .above(startDate)
  .toArray()

// Update a bill status
await db.bills.update(billId, { status: 'paid' })

// Delete a goal
await db.goals.delete(goalId)
```

## Testing

A test file is available at `src/test-db.ts` to verify the database configuration.

## Notes

- The database uses IndexedDB through Dexie.js
- All data is stored locally in the browser
- Database name: `FinanceAIDatabase`
- Version: 1
