# Issue #41: Sync Engine / Armazenamento em Nuvem

## 📋 Objetivo
Implementar sincronização bidirecional de dados financeiros entre dispositivos com conflict resolution e criptografia.

**Target:** Dados sincronizados em <2 segundos com 99.9% de consistência.

---

## 🎯 Requisitos Funcionais

### Must Have
- ✅ Sync bidirecional (device ↔️ cloud)
- ✅ Conflict resolution automático
- ✅ Offline-first (funciona sem conexão)
- ✅ Criptografia end-to-end
- ✅ Multi-device support

### Nice to Have
- 🔄 Real-time sync (WebSocket)
- 🔄 Selective sync (escolher o que sincronizar)
- 🔄 Versioning/History
- 🔄 Backup automático

---

## 🏗️ Opções de Arquitetura

### **Opção A: Supabase (RECOMENDADO)**

**Por quê:**
- ✅ PostgreSQL nativo (dados estruturados)
- ✅ Real-time subscriptions built-in
- ✅ Row Level Security (RLS)
- ✅ Auth integrado (OAuth, Email, etc)
- ✅ Storage para arquivos
- ✅ Free tier generoso (500MB DB, 2GB bandwidth)

**Arquitetura:**
```
┌─────────────────────────────────────────────────┐
│              FinanceAI Client                    │
│  ┌──────────────────────────────────────────┐  │
│  │  useKV (localStorage)                    │  │
│  │  ↓ sync on change                        │  │
│  │  SyncManager                             │  │
│  │  - Queue operations                      │  │
│  │  - Detect conflicts                      │  │
│  │  - Merge strategies                      │  │
│  └────────────┬─────────────────────────────┘  │
└───────────────┼─────────────────────────────────┘
                │
                │ HTTPS + WebSocket
                ▼
┌─────────────────────────────────────────────────┐
│            Supabase Backend                      │
│  ┌──────────────────────────────────────────┐  │
│  │  PostgreSQL                              │  │
│  │  - transactions table                    │  │
│  │  - bills table                           │  │
│  │  - goals table                           │  │
│  │  - sync_metadata (timestamps, versions) │  │
│  │                                          │  │
│  │  Row Level Security:                     │  │
│  │  - Users only see own data              │  │
│  │  - Encrypted fields (pgcrypto)          │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Real-time Engine (WebSocket)                   │
│  - Push updates to clients                      │
│  - Broadcast changes                            │
└─────────────────────────────────────────────────┘
```

**Custo:**
- Free: 500MB DB, 2GB bandwidth, 50k reqs/mês
- Pro ($25/mês): 8GB DB, 250GB bandwidth
- **Estimativa:** Free tier suficiente para MVP (até 1000 usuários)

---

### **Opção B: Firebase (Alternativa)**

**Por quê:**
- ✅ Firestore = NoSQL (mais flexível)
- ✅ Offline persistence nativa
- ✅ Security rules simples
- ✅ Auth robusto

**Contras:**
- ❌ Queries mais limitadas que SQL
- ❌ Custo pode crescer rápido (reads/writes)
- ❌ Vendor lock-in (mais difícil migrar)

**Quando usar:** Se já usa Google Cloud ou prefere NoSQL.

---

### **Opção C: Custom Backend (Node + PostgreSQL)**

**Quando usar:**
- 🔒 Compliance/LGPD extremamente rígido
- 💰 Custo é crítico (self-hosted)
- 🎨 Customização total necessária

**Contras:**
- ⏰ Muito mais tempo de desenvolvimento (3-4 semanas)
- 🐛 Mais bugs e manutenção
- 💸 Infraestrutura (server, DB, backups)

---

## 📦 Implementação (Opção A - Supabase)

### **Fase 1: Setup Supabase (2h)**

**1. Criar projeto Supabase:**
```bash
npm install @supabase/supabase-js
```

**2. Schema SQL:**
```sql
-- migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (gerenciado pelo Supabase Auth)
-- auth.users table já existe

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  
  -- Sync metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  device_id TEXT,
  
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Bills
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  due_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Repeat for bills and goals...

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### **Fase 2: Client Sync Manager (8h)**

**`src/lib/sync/sync-manager.ts`:**
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Transaction, Bill, Goal } from '../types'

export interface SyncConfig {
  supabaseUrl: string
  supabaseKey: string
  userId: string
}

export class SyncManager {
  private supabase: SupabaseClient
  private syncQueue: SyncOperation[] = []
  private isSyncing = false
  
  constructor(config: SyncConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }
  
  /**
   * Sync local changes to cloud
   */
  async pushChanges(transactions: Transaction[]): Promise<void> {
    const localData = this.getLocalData()
    const remoteData = await this.fetchRemoteData()
    
    const changes = this.detectChanges(localData, remoteData)
    
    for (const change of changes) {
      if (change.type === 'create') {
        await this.createRemote(change.entity)
      } else if (change.type === 'update') {
        await this.updateRemote(change.entity)
      } else if (change.type === 'delete') {
        await this.deleteRemote(change.entity.id)
      }
    }
  }
  
  /**
   * Pull remote changes to local
   */
  async pullChanges(): Promise<void> {
    const { data: remoteTransactions } = await this.supabase
      .from('transactions')
      .select('*')
      .gte('updated_at', this.getLastSyncTimestamp())
    
    if (!remoteTransactions) return
    
    for (const remote of remoteTransactions) {
      const local = this.findLocal(remote.id)
      
      if (!local) {
        // Remote is new, add to local
        this.addToLocal(remote)
      } else {
        // Conflict detection
        const resolved = this.resolveConflict(local, remote)
        this.updateLocal(resolved)
      }
    }
    
    this.setLastSyncTimestamp(Date.now())
  }
  
  /**
   * Resolve conflicts using Last-Write-Wins (LWW) strategy
   */
  private resolveConflict(local: Transaction, remote: Transaction): Transaction {
    // Strategy 1: Last Write Wins (LWW)
    if (remote.updated_at > local.updated_at) {
      return remote
    }
    
    // Strategy 2: Version-based (Operational Transform)
    // if (remote.version > local.version) { ... }
    
    // Strategy 3: Merge (for specific fields)
    // return { ...local, amount: remote.amount, ... }
    
    return local
  }
  
  /**
   * Enable real-time sync
   */
  enableRealtime() {
    const channel = this.supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Change received!', payload)
          this.handleRealtimeUpdate(payload)
        }
      )
      .subscribe()
  }
  
  private handleRealtimeUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    if (eventType === 'INSERT') {
      this.addToLocal(newRecord)
    } else if (eventType === 'UPDATE') {
      this.updateLocal(newRecord)
    } else if (eventType === 'DELETE') {
      this.deleteLocal(oldRecord.id)
    }
  }
  
  // Helper methods
  private getLocalData(): Transaction[] {
    return JSON.parse(localStorage.getItem('transactions') || '[]')
  }
  
  private setLastSyncTimestamp(timestamp: number) {
    localStorage.setItem('last_sync', timestamp.toString())
  }
  
  private getLastSyncTimestamp(): string {
    return localStorage.getItem('last_sync') || new Date(0).toISOString()
  }
}
```

**Hook para React:**
```typescript
// hooks/use-sync.ts
export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const syncManager = useMemo(() => {
    return new SyncManager({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      userId: 'current-user-id'
    })
  }, [])
  
  const sync = useCallback(async () => {
    setIsSyncing(true)
    setError(null)
    
    try {
      await syncManager.pushChanges()
      await syncManager.pullChanges()
      setLastSync(new Date())
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsSyncing(false)
    }
  }, [syncManager])
  
  // Auto-sync on mount
  useEffect(() => {
    sync()
    
    // Enable real-time
    syncManager.enableRealtime()
    
    // Sync every 5 minutes
    const interval = setInterval(sync, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [sync])
  
  return { sync, isSyncing, lastSync, error }
}
```

---

### **Fase 3: Criptografia E2E (6h)**

**`src/lib/crypto/encryption.ts`:**
```typescript
export class EncryptionService {
  private key: CryptoKey | null = null
  
  async generateKey(): Promise<CryptoKey> {
    this.key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    
    return this.key
  }
  
  async encrypt(data: string): Promise<{ encrypted: string; iv: string }> {
    if (!this.key) throw new Error('Key not initialized')
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(data)
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encoded
    )
    
    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv)
    }
  }
  
  async decrypt(encrypted: string, iv: string): Promise<string> {
    if (!this.key) throw new Error('Key not initialized')
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.base64ToArrayBuffer(iv) },
      this.key,
      this.base64ToArrayBuffer(encrypted)
    )
    
    return new TextDecoder().decode(decrypted)
  }
  
  // Store key securely (in practice, derive from user password)
  async exportKey(): Promise<string> {
    if (!this.key) throw new Error('Key not initialized')
    
    const exported = await crypto.subtle.exportKey('raw', this.key)
    return this.arrayBufferToBase64(exported)
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return btoa(String.fromCharCode(...bytes))
  }
  
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}
```

**Integração:**
```typescript
// Before syncing
const crypto = new EncryptionService()
await crypto.generateKey()

const transaction = { amount: 1000, description: 'Secret' }
const { encrypted, iv } = await crypto.encrypt(JSON.stringify(transaction))

await supabase.from('transactions').insert({
  data_encrypted: encrypted,
  iv: iv
})
```

---

### **Fase 4: Testing & Monitoring (4h)**

**Testes de Sync:**
```typescript
// sync-manager.test.ts
describe('SyncManager', () => {
  it('should resolve conflicts with Last-Write-Wins', () => {
    const local = { id: '1', amount: 100, updated_at: '2025-01-01T10:00:00Z' }
    const remote = { id: '1', amount: 200, updated_at: '2025-01-01T11:00:00Z' }
    
    const resolved = syncManager.resolveConflict(local, remote)
    
    expect(resolved.amount).toBe(200) // Remote wins
  })
  
  it('should handle offline queue', async () => {
    // Simulate offline
    syncManager.setOnline(false)
    
    await syncManager.createTransaction({ amount: 100 })
    expect(syncManager.queueLength).toBe(1)
    
    // Go online
    syncManager.setOnline(true)
    await syncManager.processQueue()
    
    expect(syncManager.queueLength).toBe(0)
  })
})
```

**Monitoring:**
```typescript
// Sentry integration
Sentry.addBreadcrumb({
  category: 'sync',
  message: 'Sync started',
  level: 'info'
})

try {
  await syncManager.sync()
  
  Sentry.addBreadcrumb({
    category: 'sync',
    message: 'Sync completed',
    level: 'info',
    data: { duration: performance.now() }
  })
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'sync' }
  })
}
```

---

## 📊 Critérios de Aceite

### Funcionalidades
- ✅ Dados sincronizam entre devices
- ✅ Funciona offline (queue de operações)
- ✅ Conflicts resolvidos automaticamente
- ✅ Criptografia E2E nos dados sensíveis
- ✅ Real-time updates (<2s latency)

### Performance
- ✅ Initial sync <3s (até 1000 transações)
- ✅ Incremental sync <500ms
- ✅ Offline queue suporta 10k operações
- ✅ 99.9% success rate

### Segurança
- ✅ RLS configurado corretamente
- ✅ Tokens JWT com refresh
- ✅ HTTPS only
- ✅ Criptografia AES-256-GCM

---

## 🚀 Rollout Strategy

### Phase 1: Alpha (Week 1-2)
- Supabase setup + migrations
- Basic sync (push/pull)
- Feature flag: `ENABLE_SYNC=false`

### Phase 2: Beta (Week 3-4)
- Conflict resolution
- Encryption
- Feature flag: `ENABLE_SYNC=true` (10% users)

### Phase 3: Production (Week 5)
- Real-time sync
- 100% rollout
- Monitor metrics

---

## 💰 Estimativa de Custos

**Supabase (Free Tier):**
- 500MB database
- 2GB bandwidth
- 50k API requests
- **Capacidade:** ~1000 usuários ativos

**Quando escalar para Pro ($25/mês):**
- 8GB database
- 250GB bandwidth
- **Capacidade:** ~10k usuários

**Break-even analysis:**
- Custo por usuário: $0.0025/mês
- Revenue target: >$1/usuário

---

## 🔒 Considerações de Segurança (LGPD)

1. **Consentimento:** Usuário aceita sync explicitamente
2. **Transparência:** Dashboard mostra quais dados são sincronizados
3. **Direito ao esquecimento:** Botão "Deletar dados na nuvem"
4. **Portabilidade:** Export JSON de todos os dados
5. **Auditoria:** Logs de acesso (Supabase Auth logs)

---

**Estimativa Total:** 20-25 horas
**Prioridade:** Média
**Dependencies:** Issue #40 (performance), Auth system
**Risk:** Médio (complexidade de conflict resolution)
