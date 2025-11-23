# Dexie Migration Script

This document describes the automatic migration script that moves data from localStorage to Dexie (IndexedDB).

## Overview

The migration script (`src/scripts/migrate-to-dexie.ts`) automatically migrates data from localStorage (used by the temporary adapter hooks) to Dexie tables when the app loads.

## What Gets Migrated

| Data Type | From (localStorage) | To (Dexie) |
|-----------|---------------------|------------|
| Bills | `financeai-bills` | `db.bills` table |
| Goals | `financeai-goals` | `db.goals` table |
| Language | `app-language` | `db.settings` table |

## How It Works

### 1. Automatic Detection

On app load, the migration checks if any of the following localStorage keys exist:
- `financeai-bills`
- `financeai-goals`
- `app-language`

If any exist, migration is triggered automatically.

### 2. Migration Process

For each data type:

1. **Read** data from localStorage
2. **Parse** JSON data into typed objects
3. **Transform** data to Dexie format (App types → DB types)
4. **Insert** into appropriate Dexie table
5. **Backup** original localStorage data (with `-backup` suffix)
6. **Remove** original localStorage key

### 3. Error Handling

- Errors are logged to console
- Migration continues even if individual items fail
- Original data is backed up before deletion
- Rollback function available if needed

## API

### `runMigration(): Promise<MigrationResult>`

Runs the complete migration process.

```typescript
import { runMigration } from '@/scripts/migrate-to-dexie'

const result = await runMigration()
console.log(result)
// {
//   success: true,
//   billsMigrated: 5,
//   goalsMigrated: 3,
//   languageMigrated: true,
//   errors: []
// }
```

### `needsMigration(): boolean`

Checks if migration is needed (any localStorage keys exist).

```typescript
import { needsMigration } from '@/scripts/migrate-to-dexie'

if (needsMigration()) {
  console.log('Migration needed!')
}
```

### `restoreFromBackup(): void`

Restores data from backup in case of issues.

```typescript
import { restoreFromBackup } from '@/scripts/migrate-to-dexie'

// If something went wrong, restore from backup
restoreFromBackup()
```

## Data Transformation

### Bills

```typescript
// localStorage format (App)
{
  id: "bill-123",
  description: "Electric Bill",
  amount: 150.50,
  dueDate: "2024-12-01T00:00:00.000Z",
  status: "pending",
  recurrence: "monthly",
  createdAt: "2024-11-01T00:00:00.000Z"
}

// Dexie format (DB)
{
  id: 1, // auto-increment
  description: "Electric Bill",
  amount: 150.50,
  dueDate: Date("2024-12-01"),
  status: "pending",
  recurrence: "monthly",
  createdAt: Date("2024-11-01"),
  updatedAt: Date(now)
}
```

### Goals

```typescript
// localStorage format (App)
{
  id: "goal-456",
  description: "Emergency Fund",
  targetAmount: 10000,
  currentAmount: 2500,
  deadline: "2025-12-31T00:00:00.000Z",
  type: "savings",
  createdAt: "2024-11-01T00:00:00.000Z"
}

// Dexie format (DB)
{
  id: 1, // auto-increment
  description: "Emergency Fund",
  targetAmount: 10000,
  currentAmount: 2500,
  deadline: Date("2025-12-31"),
  type: "savings",
  createdAt: Date("2024-11-01"),
  updatedAt: Date(now)
}
```

### Language

```typescript
// localStorage format
"pt-BR"

// Dexie format (DB)
{
  id: 1,
  key: "app-language",
  value: "pt-BR",
  createdAt: Date(now),
  updatedAt: Date(now)
}
```

## Integration in App.tsx

The migration is integrated into `App.tsx` and runs automatically on first load:

```typescript
useEffect(() => {
  const runMigrationIfNeeded = async () => {
    if (needsMigration()) {
      console.log('Migration needed, running...')
      try {
        const result = await runMigration()
        if (result.success) {
          toast.success(`Migration complete! ${result.billsMigrated} bills, ${result.goalsMigrated} goals migrated.`)
        } else {
          toast.error('Migration completed with errors. Check console.')
        }
      } catch (error) {
        console.error('Migration error:', error)
        toast.error('Data migration error')
      }
    }
    setMigrationComplete(true)
  }
  
  runMigrationIfNeeded()
}, [language])
```

## Backup and Rollback

### Backup Keys

After successful migration, backups are stored in localStorage:
- `financeai-bills-backup`
- `financeai-goals-backup`
- `app-language-backup`

### Manual Rollback

If you need to rollback:

```typescript
import { restoreFromBackup } from '@/scripts/migrate-to-dexie'

// 1. Clear Dexie tables (optional)
import { db } from '@/database/db'
await db.bills.clear()
await db.goals.clear()
await db.settings.where('key').equals('app-language').delete()

// 2. Restore from backup
restoreFromBackup()

// 3. Reload app
window.location.reload()
```

## Testing

The migration script is tested as part of the integration:

```bash
# Build and verify no errors
npm run build

# Run unit tests for repositories
npm test

# Manual testing:
# 1. Add some bills/goals in localStorage version
# 2. Reload app
# 3. Check DevTools → IndexedDB → FinanceAI
# 4. Verify data was migrated
```

## Troubleshooting

### Migration doesn't run

**Cause**: No localStorage keys found  
**Solution**: Check if `financeai-bills`, `financeai-goals`, or `app-language` exist in localStorage

### Migration runs every time

**Cause**: localStorage keys not being removed  
**Solution**: Check console for errors during migration. Migration should remove keys after successful migration.

### Data missing after migration

**Cause**: Migration error or backup not created  
**Solution**: 
1. Check console for errors
2. Look for backup keys in localStorage
3. Use `restoreFromBackup()` to restore data

### IDs changed after migration

**Expected behavior**: Dexie uses auto-increment numeric IDs instead of string UUIDs. This is by design and doesn't affect functionality.

## Performance

- **Migration time**: ~10-50ms per item
- **App load impact**: +50-200ms on first load (only runs once)
- **Memory usage**: Minimal (loads one collection at a time)

## Security

- **Backups**: Stored in localStorage (same origin policy applies)
- **No network**: Migration is entirely local
- **Rollback**: Always available via backup keys

---

**Note**: This migration only runs once per user. Once data is migrated to Dexie, the localStorage keys are removed and migration won't run again unless you manually restore the backup.
