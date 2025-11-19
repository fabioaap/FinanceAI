# ✨ FinanceAI

Personal Finance Dashboard - A streamlined personal finance control application built with React, TypeScript, and Dexie (IndexedDB).

## 🚀 Features

- **Monthly Dashboard**: Track income, expenses, and balance with visual breakdowns
- **Transaction Management**: Add, view, and manage financial transactions
- **Bills & Reminders**: Track upcoming bills and their status
- **Savings Goals**: Set and monitor financial goals
- **AI Insights**: Get automated financial analysis and suggestions
- **Multi-language**: Support for English and Portuguese (Brazil)
- **Offline-first**: All data stored locally with IndexedDB via Dexie

## 🏗️ Architecture

### Storage Layer
- **Dexie (IndexedDB)**: Local database for offline-first data persistence
- **Workspace Package**: `@financeai/infra-db` provides database schema and operations
- **Custom Hooks**: React hooks for seamless data management

See `docs/migration-dexie.md` for detailed information about the storage architecture.

### Tech Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Dexie (IndexedDB wrapper)
- shadcn/ui components

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── packages/
│   └── infra-db/          # Database package with Dexie schema
├── src/
│   ├── components/        # React components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── modals/        # Modal dialogs
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   │   └── use-storage.ts # Dexie data hooks
│   └── lib/               # Utilities and types
└── docs/                  # Documentation
```

## 🔄 Recent Changes

**v0.2 - Dexie Migration**
- Migrated from `useKV` to Dexie for improved performance and features
- Created `@financeai/infra-db` workspace package
- Implemented custom hooks for data management
- Added comprehensive TypeScript types

## 📚 Documentation

- `docs/migration-dexie.md`: Storage architecture and migration details
- `docs/scan_spec_report.md`: Feature implementation mapping
- `PRD.md`: Product requirements and design specifications

## 🔮 Roadmap

This template implements the UI and local persistence for a FinanceAI MVP, but lacks:
- Cloud synchronization
- OAuth authentication  
- Bank statement import
- Export features

See `docs/scan_spec_report.md` for a detailed feature mapping.

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
