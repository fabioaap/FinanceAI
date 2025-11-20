# FinanceAI - AI Coding Agent Instructions

## Project Overview
Personal finance dashboard built with React 19 + Vite + TypeScript. Features bank file import, transaction tracking, bills management, and AI-powered insights. Uses GitHub Spark framework with local-first architecture.

## Tech Stack
- **Framework**: React 19 + Vite + TypeScript
- **UI**: shadcn/ui components + Radix UI primitives + Tailwind CSS 4
- **State**: `useKV` from `@github/spark/hooks` (localStorage-backed reactive state)
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Testing**: Vitest (unit) + Playwright (E2E) + happy-dom
- **CI**: GitHub Actions (lint, build, test, coverage)

## Architecture Patterns

### State Management
**Critical**: Use `useKV` hook from Spark, NOT useState for persisted data:
```tsx
const [transactions, setTransactions] = useKV<Transaction[]>(`transactions-${monthKey}`, [])
const [bills, setBills] = useKV<Bill[]>('bills', [])
```
- Data persists to localStorage automatically
- Keys use month-based partitioning: `transactions-2025-11`
- Always provide default values (arrays/objects)
- Type parameters required for type safety

### Component Structure
- **Dashboard components**: `src/components/dashboard/*` - display-only, receive data as props
- **Modal components**: `src/components/modals/*` - handle user input, call parent callbacks
- **UI components**: `src/components/ui/*` - shadcn/ui primitives (DO NOT EDIT manually)
- Main app state lives in `App.tsx`, flows down via props

### File Import System
Bank file parsing supports CSV, OFX, QIF, TXT formats:
```typescript
// In BankFileUpload.tsx or ImportBankFileModal.tsx
import { BankFileParser } from '@/lib/bank-file-parser'

const parser = new BankFileParser(file, customRules)
const result = await parser.parse(file)
// Returns: { success, transactions, errors, format, totalParsed }
```
- Auto-detects format from extension/content
- Handles BR (DD/MM/YYYY, R$ 1.234,56) and US formats
- AI-powered category suggestion via pattern matching
- Custom rules system: `useCategoryRules()` hook manages localStorage rules
- Duplicate detection: `src/lib/duplicate-detector.ts` (hash-based on date+amount+description)

### Type Definitions
All core types in `src/lib/types.ts`:
- `Transaction`: id, amount, description, date, category, type (income/expense)
- `Bill`: id, name, amount, dueDate, recurring, status (pending/paid/overdue)
- `Goal`: id, name, targetAmount, currentAmount, dueDate
- `CategoryType`: 'food' | 'transport' | 'shopping' | 'health' | 'home' | 'entertainment' | 'education' | 'work' | 'other'

## Development Workflows

### Running the App
```powershell
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
```

### Testing
```powershell
npm test             # Run unit tests (Vitest)
npm run test:ui      # Vitest UI
npm run test:coverage # Coverage report
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright UI mode
```

### Building
```powershell
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

### Adding UI Components
**DO NOT** edit `src/components/ui/*` manually. These are managed by shadcn/ui CLI:
```powershell
npx shadcn@latest add <component-name>
```

## Code Conventions

### Imports
Use `@/` alias (maps to `src/`):
```typescript
import { Button } from '@/components/ui/button'
import { Transaction } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
```

### Icons
Use Phosphor Icons with consistent styling:
```tsx
import { Upload, Plus, Trash } from '@phosphor-icons/react'
<Upload size={20} weight="bold" />
```

### Internationalization
Translation system in `src/lib/i18n.ts`:
```tsx
const [language] = useKV<Language>('app-language', 'en')
const t = getTranslation(language || 'en')
// Use: t.app.title, t.transactions.add, etc.
```

### Date/Month Handling
Use utilities from `src/lib/constants.ts`:
```typescript
import { getMonthKey, formatMonthYear } from '@/lib/constants'
const monthKey = getMonthKey(new Date()) // "2025-11"
const displayDate = formatMonthYear(date) // "November 2025"
```

### Toasts
Use Sonner for notifications:
```tsx
import { toast } from 'sonner'
toast.success('Transaction added!')
toast.error('Failed to parse file')
```

## Known Integration Points

### Spark Framework
- **useKV**: Reactive localStorage hook with change subscriptions
- **Spark Vite Plugin**: Handles asset optimization (`vite.config.ts`)
- **Icon Proxy**: Auto-imports Phosphor icons (`createIconImportProxy()`)

### Dexie Database (Placeholder)
`@financeai/infra-db` package referenced but NOT implemented:
- `src/hooks/use-db.ts` contains commented-out Dexie hooks
- Current implementation uses `useKV` fallback
- If implementing: create Dexie schema per `docs/db_schema.md`

### CI Pipeline
`.github/workflows/ci.yml` runs on push/PR:
- Linting, building, unit tests, E2E tests
- Codecov integration (requires `CODECOV_TOKEN` secret)
- Node 20, ubuntu-latest

## Common Tasks

### Adding a New Modal
1. Create in `src/components/modals/YourModal.tsx`
2. Accept `open`, `onOpenChange`, and callback props
3. Add state in `App.tsx`: `const [showYourModal, setShowYourModal] = useState(false)`
4. Add trigger button and modal instance in JSX

### Adding Transaction Categories
1. Update `CategoryType` union in `src/lib/types.ts`
2. Add translation keys in `src/lib/i18n.ts` (both en and pt-BR)
3. Update category suggestion logic in `bank-file-parser.ts` (`suggestCategory()`)

### Adding File Format Support
1. Add format to `BankFileFormat` type in `types.ts`
2. Implement `parseXYZ()` method in `BankFileParser` class
3. Update `detectFormat()` to recognize new format
4. Add unit tests in `bank-file-parser.test.ts`

## Critical Files
- `src/App.tsx` - Main app logic, state orchestration (293 lines)
- `src/lib/bank-file-parser.ts` - File parsing engine (609 lines)
- `src/lib/types.ts` - Central type definitions
- `docs/STATUS_BACKLOG.md` - Implementation status, completed features (80% done)
- `docs/GUIA_INTEGRACAO.md` - Integration guide with code examples

## Testing Expectations
- Unit tests: Target 80%+ coverage, focus on parser logic
- E2E tests: Cover critical flows (import, transaction CRUD)
- Test files use `.test.ts` suffix, placed alongside source files
- Mock file uploads using `new File(['content'], 'name.csv')`

## Performance Notes
- Virtual scrolling NOT implemented - consider for >1000 transactions
- File parsing happens synchronously - issue #40 proposes Web Workers for 10k+ lines
- Month-based partitioning keeps transaction arrays small

## Future Work (Backlog)
- Issue #40: Web Worker parsing for large files (>10k lines)
- Issue #41: Cloud sync engine with conflict resolution
- Migrate from `useKV` to Dexie for advanced queries
- OAuth/API integrations per original PRD (currently local-only)

---

**Last Updated**: 2025-11-19  
**Project Status**: 80% complete (8/10 backlog issues done)  
**GitHub**: https://github.com/fabioaap/FinanceAI
