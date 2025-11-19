# FinanceAI

A monorepo for FinanceAI - Personal Finance Management Application

## Project Structure

This is a monorepo managed with npm workspaces containing the following packages:

- **[@financeai/infra-db](./packages/infra-db)** - Database infrastructure package using Dexie (IndexedDB wrapper) for managing financial transactions

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Install all dependencies for the monorepo:

```bash
npm install
```

### Building

Build all packages:

```bash
npm run build
```

### Linting

Run TypeScript type checking on all packages:

```bash
npm run lint
```

## Packages

### @financeai/infra-db

Database infrastructure package that provides a simple API for managing financial transactions using IndexedDB (via Dexie).

**Key Features:**
- Transaction management (add, get, update, delete)
- Type-safe TypeScript API
- IndexedDB-based storage for offline-first capabilities
- Helper functions for common operations

**Quick Example:**

```typescript
import { addTransaction, getAllTransactions } from '@financeai/infra-db';

// Add a transaction
await addTransaction({
  amount: 100.50,
  description: 'Grocery shopping',
  category: 'Food',
  date: new Date(),
  type: 'expense'
});

// Get all transactions
const transactions = await getAllTransactions();
```

See the [package README](./packages/infra-db/README.md) for detailed documentation.

## Examples

Example usage can be found in the [examples](./examples) directory:

- [basic-usage.ts](./examples/basic-usage.ts) - Basic usage of the @financeai/infra-db package

## Development

### Adding a New Package

1. Create a new directory under `packages/`
2. Initialize with `package.json` and `tsconfig.json`
3. Add the package to the workspace in the root `package.json`
4. Run `npm install` to link the package

### Scripts

- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run test` - Run tests for all packages (if available)

## License

ISC