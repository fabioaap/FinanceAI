# @financeai/infra-db

Database infrastructure package for FinanceAI using Dexie (IndexedDB wrapper).

## Installation

```bash
npm install @financeai/infra-db
```

## Usage

### Basic Example

```typescript
import { addTransaction, getAllTransactions } from '@financeai/infra-db';

// Add a new transaction
const transactionId = await addTransaction({
  amount: 100.50,
  description: 'Grocery shopping',
  category: 'Food',
  date: new Date(),
  type: 'expense'
});

// Get all transactions
const transactions = await getAllTransactions();
console.log(transactions);
```

### Available Functions

#### `addTransaction(transaction)`
Adds a new transaction to the database.

**Parameters:**
- `transaction`: Transaction object without `id` and `createdAt` (auto-generated)
  - `amount`: number - Transaction amount
  - `description`: string - Transaction description
  - `category`: string - Transaction category
  - `date`: Date - Transaction date
  - `type`: 'income' | 'expense' - Transaction type

**Returns:** Promise with the id of the newly created transaction

#### `getAllTransactions()`
Retrieves all transactions from the database.

**Returns:** Promise with array of all transactions

#### `getTransactionById(id)`
Gets a specific transaction by its id.

**Parameters:**
- `id`: number - Transaction id

**Returns:** Promise with the transaction or undefined if not found

#### `updateTransaction(id, updates)`
Updates a transaction with new values.

**Parameters:**
- `id`: number - Transaction id
- `updates`: Partial transaction object with fields to update

**Returns:** Promise with the number of updated records (0 or 1)

#### `deleteTransaction(id)`
Deletes a transaction by its id.

**Parameters:**
- `id`: number - Transaction id

**Returns:** Promise that resolves when the transaction is deleted

#### `getTransactionsByType(type)`
Gets all transactions of a specific type.

**Parameters:**
- `type`: 'income' | 'expense' - Transaction type

**Returns:** Promise with array of transactions of the specified type

#### `getTransactionsByCategory(category)`
Gets all transactions in a specific category.

**Parameters:**
- `category`: string - Transaction category

**Returns:** Promise with array of transactions in the specified category

#### `clearAllTransactions()`
Clears all transactions from the database.

**Returns:** Promise that resolves when all transactions are deleted

### Direct Database Access

You can also access the database instance directly:

```typescript
import { db } from '@financeai/infra-db';

// Use Dexie API directly
const recentTransactions = await db.transactions
  .where('date')
  .above(new Date('2024-01-01'))
  .toArray();
```

## TypeScript

This package is written in TypeScript and includes type definitions.

```typescript
import { Transaction } from '@financeai/infra-db';

const transaction: Transaction = {
  amount: 50.00,
  description: 'Coffee',
  category: 'Food & Drink',
  date: new Date(),
  type: 'expense'
};
```

## Database Schema

The database uses IndexedDB with the following schema:

**transactions** table:
- `id` (auto-increment primary key)
- `amount` (number)
- `description` (string)
- `category` (string)
- `date` (Date)
- `type` ('income' | 'expense')
- `createdAt` (Date, auto-generated)

## Building

```bash
npm run build
```

## License

ISC
