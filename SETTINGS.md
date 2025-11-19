# Settings Storage with Dexie

This module provides a simple key-value storage system for app-wide settings using Dexie (IndexedDB wrapper).

## Features

- **Persistent storage**: Settings are stored in IndexedDB and persist across browser sessions
- **Type-safe**: Built with TypeScript for type safety
- **JSON support**: Automatically handles JSON serialization for complex objects
- **Migration utilities**: Tools to migrate from localStorage to Dexie

## Usage

### Basic Operations

```typescript
import { getSetting, setSetting, deleteSetting } from './lib/db';

// Set a simple string value
await setSetting('app-language', 'en-US');

// Set a JSON object
await setSetting('theme-config', { mode: 'dark', primaryColor: '#000' });

// Get a setting
const language = await getSetting('app-language');
console.log(language); // 'en-US'

// Get and parse JSON
const theme = await getSetting('theme-config');
const themeObj = JSON.parse(theme!);
console.log(themeObj.mode); // 'dark'

// Delete a setting
await deleteSetting('app-language');
```

### Advanced Operations

```typescript
import { getAllSettings, clearAllSettings } from './lib/db';

// Get all settings
const allSettings = await getAllSettings();
console.log(allSettings); // [{ key: 'app-language', value: 'en-US' }, ...]

// Clear all settings
await clearAllSettings();
```

### Migration from localStorage

If you have existing settings in localStorage, you can migrate them to Dexie:

```typescript
import { 
  migrateFromLocalStorage, 
  migrateFromLocalStorageByPrefix,
  checkMigrationNeeded 
} from './lib/migrate';

// Migrate specific keys
const result = await migrateFromLocalStorage([
  'app-language',
  'theme-config',
  'user-preferences'
]);
console.log(`Migrated ${result.migrated} settings`);

// Migrate all keys with a prefix
const prefixResult = await migrateFromLocalStorageByPrefix('app-');
console.log(`Migrated ${prefixResult.migrated} settings`);

// Check which keys need migration
const keysToMigrate = await checkMigrationNeeded([
  'app-language',
  'theme-config'
]);
console.log(`Keys needing migration: ${keysToMigrate.join(', ')}`);

// Migrate and remove from localStorage
await migrateFromLocalStorage(['old-setting'], true);
```

## Database Schema

The settings table has the following structure:

```typescript
interface Setting {
  key: string;      // Primary key
  value: string;    // Value stored as string (JSON for objects)
}
```

## API Reference

### Core Functions

#### `getSetting(key: string): Promise<string | undefined>`
Retrieves a setting value by key.

#### `setSetting(key: string, value: string | object): Promise<void>`
Sets a setting value. Objects are automatically JSON-stringified.

#### `deleteSetting(key: string): Promise<void>`
Deletes a setting by key.

#### `getAllSettings(): Promise<Setting[]>`
Retrieves all settings.

#### `clearAllSettings(): Promise<void>`
Clears all settings from the database.

### Migration Functions

#### `migrateFromLocalStorage(keys: string[], removeFromLocalStorage?: boolean): Promise<{ migrated: number; failed: string[] }>`
Migrates specific keys from localStorage to Dexie.

#### `migrateFromLocalStorageByPrefix(prefix: string, removeFromLocalStorage?: boolean): Promise<{ migrated: number; failed: string[] }>`
Migrates all localStorage keys matching a prefix.

#### `checkMigrationNeeded(keys: string[]): Promise<string[]>`
Checks which keys exist in localStorage but not in Dexie.

## Testing

The module includes comprehensive tests covering:
- Basic CRUD operations
- JSON serialization
- Type validation
- Migration scenarios
- Edge cases

Run tests with:
```bash
npm test
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```
