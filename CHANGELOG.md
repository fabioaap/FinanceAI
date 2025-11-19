# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-19

### Added

#### Core Features
- **SyncEngine**: Main orchestration engine for data synchronization
  - Offline-first architecture with automatic sync when online
  - Configurable sync intervals and batch processing
  - Support for push, pull, and bidirectional sync
  - Multiple conflict resolution strategies (local-wins, remote-wins, last-modified-wins, manual)
  - Event-driven architecture with comprehensive event system

#### Queue Management
- **SyncQueue**: Dexie-based persistent queue for offline operations
  - Automatic queuing of create, update, and delete operations
  - Batch processing support
  - Automatic cleanup of old synced records
  - Queue statistics and monitoring

#### Network Handling
- **NetworkMonitor**: Robust online/offline detection
  - Browser event listeners for instant status changes
  - Optional periodic connectivity checks
  - Subscriber pattern for status notifications

#### Cloud Providers
- **SupabaseProvider**: Complete Supabase integration
  - Automatic conflict detection and reporting
  - Support for upsert, delete, and query operations
  - Configurable table prefix for organization
  
- **HttpProvider**: Generic REST API integration
  - Customizable base URL and headers
  - API key authentication support
  - Request timeout configuration
  - Compatible with any REST API following the sync protocol

#### Developer Tools
- **EventEmitter**: Type-safe event system
  - Generic event handling with TypeScript support
  - Easy subscription/unsubscription
  - Multiple listeners per event

#### Testing
- Comprehensive test suite with 15 unit tests
- Mock providers for testing
- IndexedDB simulation with fake-indexeddb
- 100% test coverage on core utilities

#### Documentation
- Complete README with installation and usage instructions
- API reference documentation
- Example implementations for Supabase and HTTP providers
- Technical summary document
- TypeScript type definitions

#### Build & Development
- TypeScript configuration with strict mode
- ESLint configuration for code quality
- Vitest test runner with jsdom environment
- npm scripts for build, test, and lint
- Source maps for debugging

### Technical Details

#### Dependencies
- `dexie` ^4.0.10 for IndexedDB abstraction
- Minimal production dependencies for small bundle size
- Optional peer dependency on `@supabase/supabase-js`

#### Architecture
- Modular design with clear separation of concerns
- Provider pattern for extensibility
- Event-driven for loose coupling
- Type-safe throughout with TypeScript

#### Performance
- Batch processing to reduce API calls
- Incremental sync with timestamp tracking
- Efficient queue management
- Configurable intervals to balance freshness and performance

### Configuration Options

All sync behaviors are configurable:
- `syncInterval`: How often to sync (default: 30s)
- `maxRetries`: Retry attempts for failed syncs (default: 3)
- `direction`: Sync direction (default: bidirectional)
- `conflictResolution`: How to handle conflicts (default: last-modified-wins)
- `autoSync`: Enable automatic syncing (default: true)
- `batchSize`: Records per sync batch (default: 50)

### Events

- `status-change`: Sync status changed
- `sync-start`: Sync operation started
- `sync-complete`: Sync operation completed
- `sync-error`: Sync error occurred
- `conflict`: Data conflict detected
- `online`: Network came online
- `offline`: Network went offline

[0.1.0]: https://github.com/fabioaap/FinanceAI/releases/tag/v0.1.0
