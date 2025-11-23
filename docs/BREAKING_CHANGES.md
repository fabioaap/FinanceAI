# Breaking Changes - Spark Framework Removal

## Overview

This document describes all breaking changes introduced by removing the Spark Framework and migrating to Dexie + localStorage.

**Version**: Post-Spark Migration  
**Date**: November 2024  
**Severity**: Medium (requires code updates for extensions/integrations)

---

## API Changes

### 1. Transaction IDs Changed from String to Number

**Impact**: High  
**Affected**: Direct database access, transaction references

#### Before
```typescript
interface Transaction {
  id: string  // UUID format: "550e8400-e29b-41d4-a716-446655440000"
  amount: number
  description: string
  // ...
}
```

#### After
```typescript
interface Transaction {
  id?: number  // Auto-incrementing integer from IndexedDB
  amount: number
  description: string
  // ...
}
```

**Migration Path:**
- Old string IDs cannot be directly converted to numeric IDs
- Transactions stored with Spark will need to be reimported
- The `useAppTransactions` adapter handles this conversion internally

---

### 2. Transaction Handlers Now Async

**Impact**: High  
**Affected**: All components calling transaction functions

#### Before
```typescript
const handleAddTransaction = (transaction: Transaction) => {
  setTransactions([...transactions, transaction])
}

// Usage
handleAddTransaction(newTransaction)
```

#### After
```typescript
const handleAddTransaction = async (transaction: Transaction) => {
  try {
    await addTransaction(transaction)
    toast.success('Transaction added')
  } catch (error) {
    toast.error('Failed to add transaction')
  }
}

// Usage
await handleAddTransaction(newTransaction)
// or
handleAddTransaction(newTransaction)  // Fire and forget
```

**Migration Path:**
- Add `async` keyword to all transaction handler functions
- Wrap calls in try/catch for error handling
- Add toast notifications for user feedback

---

### 3. Bills and Goals Handlers Now Async

**Impact**: Medium  
**Affected**: Bill and goal management components

#### Before
```typescript
const handleAddBill = (bill: Bill) => {
  setBills([...bills, bill])
}

const handleAddGoal = (goal: Goal) => {
  setGoals([...goals, goal])
}
```

#### After
```typescript
const handleAddBill = async (bill: Bill) => {
  try {
    await addBill(bill)
    toast.success('Bill added successfully')
  } catch (error) {
    toast.error('Failed to add bill')
  }
}

const handleAddGoal = async (goal: Goal) => {
  try {
    await addGoal(goal)
    toast.success('Goal added successfully')
  } catch (error) {
    toast.error('Failed to add goal')
  }
}
```

**Migration Path:**
- Add `async` keyword to handler functions
- Add error handling with try/catch
- Consider adding loading states for better UX

---

### 4. Language State No Longer Reactive

**Impact**: Low  
**Affected**: Components that depend on language changes

#### Before
```typescript
import { useKV } from '@github/spark/hooks'
const [language, setLanguage] = useKV<Language>('app-language', 'en')
// Automatically synced across tabs/components
```

#### After
```typescript
const [language, setLanguage] = useState<Language>(() => 
  (localStorage.getItem('app-language') as Language) || 'en'
)

useEffect(() => {
  localStorage.setItem('app-language', language)
}, [language])
// Manual persistence, no cross-tab sync
```

**Migration Path:**
- Implement custom storage events if cross-tab sync is needed
- Consider using Context API for global language state

---

## Storage Changes

### 1. Transaction Storage Location

**Before:** `localStorage` key `transactions-YYYY-MM`  
**After:** IndexedDB database `FinanceAI` → table `transactions`

**Data Migration:**
- Old transactions in localStorage are NOT automatically migrated
- Users need to export/reimport data if preserving history
- Month-based partitioning removed (all transactions in single table)

### 2. Bills Storage

**Before:** `localStorage` key `bills` (via useKV)  
**After:** `localStorage` key `financeai-bills` (via useBillsAdapter)

**Data Migration:**
- Data persists in localStorage but with different key
- Run migration script to copy from `bills` to `financeai-bills`

### 3. Goals Storage

**Before:** `localStorage` key `goals` (via useKV)  
**After:** `localStorage` key `financeai-goals` (via useGoalsAdapter)

**Data Migration:**
- Data persists in localStorage but with different key
- Run migration script to copy from `goals` to `financeai-goals`

### 4. Category Rules Storage

**Before:** `localStorage` key `category-rules` (via useKV)  
**After:** `localStorage` key `category-rules` (via useState + useEffect)

**Data Migration:**
- No migration needed (same key)
- Format remains identical

---

## Import Changes

### 1. Removed Imports

```typescript
// ❌ No longer available
import { useKV } from '@github/spark/hooks'
import "@github/spark/spark"
import sparkPlugin from "@github/spark/spark-vite-plugin"
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin"
```

### 2. New Imports

```typescript
// ✅ Use instead
import { useAppTransactions, useBillsAdapter, useGoalsAdapter } from '@/hooks'
```

---

## Build Configuration Changes

### vite.config.ts

#### Before
```typescript
import { defineConfig, PluginOption } from "vite"
import sparkPlugin from "@github/spark/spark-vite-plugin"
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
})
```

#### After
```typescript
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

---

## Performance Changes

### Bundle Size
- **Reduction**: ~4.5 KB total (~1.3 KB gzipped)
- **Dependencies**: 29 fewer packages in node_modules

### Runtime Performance
- **Initial Load**: +10-50ms (IndexedDB initialization)
- **Subsequent Operations**: Minimal impact (Dexie caching)
- **Memory Usage**: Slight increase (Dexie in-memory cache)

---

## Feature Parity

All features remain functional:
- ✅ Transaction CRUD operations
- ✅ Bills management
- ✅ Goals tracking
- ✅ Language preference
- ✅ Category mapping rules
- ✅ Bank file import
- ✅ Month-based transaction filtering

---

## Migration Checklist

For developers extending FinanceAI:

- [ ] Update transaction handler signatures to `async`
- [ ] Add try/catch blocks around database operations
- [ ] Replace `useKV` imports with new adapter hooks
- [ ] Update transaction ID types from `string` to `number`
- [ ] Test localStorage quota handling (bills/goals)
- [ ] Test IndexedDB support in target browsers
- [ ] Add error boundaries for database failures
- [ ] Update tests to mock Dexie instead of useKV

---

## Rollback Instructions

If you need to revert to Spark:

1. **Code Rollback**
   ```bash
   git revert HEAD~8..HEAD  # Revert last 8 commits
   npm install              # Restore @github/spark
   ```

2. **Data Migration**
   - Export transactions from IndexedDB
   - Convert numeric IDs to UUIDs
   - Import to localStorage with `transactions-YYYY-MM` keys

3. **Storage Key Migration**
   ```javascript
   // Copy bills from new to old key
   const bills = localStorage.getItem('financeai-bills')
   localStorage.setItem('bills', bills)
   
   // Copy goals from new to old key
   const goals = localStorage.getItem('financeai-goals')
   localStorage.setItem('goals', goals)
   ```

---

## Support

For issues related to this migration:
1. Check [MIGRATION_SPARK_TO_DEXIE.md](./MIGRATION_SPARK_TO_DEXIE.md) troubleshooting section
2. Verify IndexedDB is enabled in browser
3. Check localStorage quota (usually 5-10MB)
4. Open an issue with error logs and browser info

---

**Last Updated**: November 2024  
**Migration Status**: Complete  
**Review Required**: Yes
