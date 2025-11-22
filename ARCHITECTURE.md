# Arquitetura do Repository Pattern

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│                    (UI Layer - App.tsx)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ usa hooks
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom React Hooks                        │
│     useTransactions | useCategories | useBudgets ...        │
│                   (Presentation Logic)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ chama métodos
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repositories                            │
│  TransactionRepository | CategoryRepository | ...           │
│              (Business Logic Layer)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ herda de
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BaseRepository<T>                         │
│              (Abstract CRUD Operations)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ usa Dexie Table
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Dexie Database (db.ts)                     │
│            (Data Access Layer - IndexedDB)                   │
└─────────────────────────────────────────────────────────────┘
```

## Camadas da Arquitetura

### 1. UI Layer (Componentes React)
- **Responsabilidade**: Renderizar UI e capturar interações do usuário
- **Conhecimento**: Apenas sobre os hooks, não sabe nada sobre Dexie
- **Exemplo**: `App.tsx`, `TransactionList.tsx`

### 2. Presentation Logic (Custom Hooks)
- **Responsabilidade**: Gerenciar estado da UI e orquestrar chamadas aos repositories
- **Conhecimento**: Hooks do React, tipos de dados, repositories
- **Benefícios**: 
  - Estado compartilhado entre componentes
  - Loading/error states automáticos
  - Atualização reativa dos dados

### 3. Business Logic (Repositories)
- **Responsabilidade**: Operações de negócio e lógica de domínio
- **Conhecimento**: Dexie tables, regras de negócio específicas
- **Exemplos de Lógica**:
  - `TransactionRepository.getTotalByType()` - cálculos
  - `CategoryRepository.exists()` - validações
  - `BudgetRepository.getActiveBudgets()` - filtros complexos

### 4. Abstract Layer (BaseRepository)
- **Responsabilidade**: CRUD genérico para qualquer entidade
- **Benefícios**: 
  - DRY - código não se repete
  - Timestamps automáticos
  - Interface consistente

### 5. Data Access (Dexie Database)
- **Responsabilidade**: Comunicação direta com IndexedDB
- **Conhecimento**: Schema do banco, índices, versões

## Fluxo de Dados

### Leitura (Read Flow)
```
Componente → Hook → Repository → Dexie → IndexedDB
                ↓
            useState
                ↓
            re-render
```

### Escrita (Write Flow)
```
User Action → Handler → Hook.create() → Repository.create()
                                             ↓
                                        Dexie.add()
                                             ↓
                                        IndexedDB
                                             ↓
                                        Hook.refresh()
                                             ↓
                                        Re-render componente
```

## Padrões Utilizados

### 1. Repository Pattern
Isola lógica de acesso a dados em classes específicas.

### 2. Hook Pattern (React)
Encapsula lógica stateful em funções reutilizáveis.

### 3. Generic Programming
`BaseRepository<T>` funciona para qualquer tipo.

### 4. Dependency Injection
Repositories recebem a Dexie Table no construtor.

## Extensibilidade

### Adicionar Nova Entidade

1. **Criar tipo** em `src/types/index.ts`:
```typescript
export interface NewEntity {
  id?: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

2. **Adicionar à database** em `src/database/db.ts`:
```typescript
export class FinanceDatabase extends Dexie {
  newEntities!: Table<NewEntity>;
  
  constructor() {
    super('FinanceAI');
    this.version(2).stores({
      // ... tabelas existentes
      newEntities: '++id, name, createdAt, updatedAt'
    });
  }
}
```

3. **Criar Repository** em `src/repositories/NewEntityRepository.ts`:
```typescript
export class NewEntityRepository extends BaseRepository<NewEntity> {
  constructor() {
    super(db.newEntities);
  }
  
  // Métodos específicos aqui
}

export const newEntityRepository = new NewEntityRepository();
```

4. **Criar Hook** em `src/hooks/useNewEntities.ts`:
```typescript
export const useNewEntities = () => {
  const [entities, setEntities] = useState<NewEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ... implementação similar aos outros hooks
  
  return { entities, loading, create, update, delete };
};
```

## Testabilidade

### Testar Repositories
```typescript
describe('NewEntityRepository', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('should create entity', async () => {
    const id = await repository.create({ name: 'Test' });
    expect(id).toBeGreaterThan(0);
  });
});
```

### Testar Hooks (com Mock)
```typescript
vi.mock('@/repositories', () => ({
  newEntityRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(1),
  }
}));
```

### Testar Componentes
```typescript
const mockHook = {
  entities: [],
  loading: false,
  create: vi.fn(),
};

vi.mock('@/hooks', () => ({
  useNewEntities: () => mockHook
}));
```

## Performance

### Otimizações Implementadas

1. **Índices Dexie**: Queries rápidas por campos indexados
2. **React.useCallback**: Evita recriação de funções
3. **Loading States**: UI responsiva durante operações assíncronas
4. **Dexie Promises**: Operações em lote quando possível

### Boas Práticas

- Use filtros no hook quando possível: `useTransactions({ type: 'expense' })`
- Evite chamar `refresh()` desnecessariamente
- Use `React.memo()` para componentes que renderizam listas
- Considere paginação para grandes datasets

## Segurança

### Validações Implementadas

1. **TypeScript**: Validação de tipos em tempo de compilação
2. **Repository validations**: Ex: `CategoryRepository.exists()`
3. **Error handling**: Try/catch em todas operações assíncronas

### Recomendações

- Valide dados antes de criar/atualizar
- Sanitize inputs do usuário
- Use HTTPS se sincronizar com backend
- Considere criptografia para dados sensíveis

## Conclusão

Esta arquitetura fornece:
- ✅ Separação clara de responsabilidades
- ✅ Código reutilizável e testável
- ✅ Fácil manutenção e extensão
- ✅ Type safety com TypeScript
- ✅ Performance otimizada
- ✅ Developer experience excelente
