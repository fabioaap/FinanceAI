# @financeai/infra-db

Database infrastructure package using Dexie (IndexedDB wrapper) for FinanceAI.

## Overview

This package provides a simple and type-safe interface for managing financial transactions in the browser using IndexedDB through Dexie.

## Installation

This package is part of the FinanceAI monorepo workspace. It's automatically available to other packages in the workspace.

## Usage

### Database Instance

The package exports a singleton database instance:

```typescript
import { db } from '@financeai/infra-db';
```

### Types

```typescript
interface Transaction {
  id?: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  createdAt?: Date;
}
```

### Helper Functions

#### Add Transaction

```typescript
import { addTransaction } from '@financeai/infra-db';

const id = await addTransaction({
  amount: 100,
  description: 'Grocery shopping',
  category: 'food',
  date: new Date(),
  type: 'expense'
});
```

#### Get All Transactions

```typescript
import { getAllTransactions } from '@financeai/infra-db';

const transactions = await getAllTransactions();
```

#### Get Transaction by ID

```typescript
import { getTransactionById } from '@financeai/infra-db';

const transaction = await getTransactionById(1);
```

#### Update Transaction

```typescript
import { updateTransaction } from '@financeai/infra-db';

await updateTransaction(1, {
  amount: 150,
  description: 'Updated description'
});
```

#### Delete Transaction

```typescript
import { deleteTransaction } from '@financeai/infra-db';

await deleteTransaction(1);
```

#### Filter Transactions

```typescript
import { getTransactionsByType, getTransactionsByCategory } from '@financeai/infra-db';

// Get all expenses
const expenses = await getTransactionsByType('expense');

// Get all food transactions
const foodTransactions = await getTransactionsByCategory('food');
```

#### Clear All Transactions

```typescript
import { clearAllTransactions } from '@financeai/infra-db';

await clearAllTransactions();
```

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run lint
```

### Clean

```bash
npm run clean
```

## Database Schema

The database uses the following schema:

- **Database Name**: `FinanceAIDB`
- **Version**: 1
- **Tables**:
  - `transactions`: Stores all financial transactions
    - Primary key: `++id` (auto-increment)
    - Indexed fields: `amount`, `description`, `category`, `date`, `type`, `createdAt`

## Technologies

- [Dexie](https://dexie.org/) - A minimalistic wrapper for IndexedDB
- TypeScript - For type safety
