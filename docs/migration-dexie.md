# Migração de useKV para Dexie

Este documento descreve a migração da persistência de dados usando `useKV` do `@github/spark/hooks` para uma solução baseada em Dexie (IndexedDB).

## Motivação

A migração para Dexie proporciona:
- **Maior controle**: Gerenciamento completo do esquema e operações do banco de dados
- **Melhor performance**: IndexedDB é otimizado para grandes volumes de dados
- **Suporte offline robusto**: Capacidades nativas do IndexedDB
- **Queries avançadas**: Filtragem, ordenação e indexação eficientes
- **Preparação para sincronização**: Infraestrutura para futura sincronização com backend

## Arquitetura

### 1. Pacote @financeai/infra-db

Criado em `packages/infra-db/` como workspace package, contém:

**Schema Dexie (v1):**
- `transactions`: Transações financeiras (receitas e despesas)
- `categories`: Categorias personalizadas
- `bills`: Contas a pagar/receber
- `goals`: Metas financeiras
- `settings`: Configurações da aplicação (idioma, etc.)

**Operações CRUD completas** para todas as entidades:
- `add*()`: Criar novos registros
- `getAll*()`: Listar todos os registros
- `update*()`: Atualizar registros existentes
- `delete*()`: Remover registros

### 2. Hooks customizados (src/hooks/use-storage.ts)

Criados hooks React que encapsulam as operações do Dexie:

- `useTransactions(monthKey?)`: Gerencia transações, com filtro opcional por mês
- `useBills()`: Gerencia contas a pagar
- `useGoals()`: Gerencia metas de economia
- `useLanguageSetting()`: Gerencia configuração de idioma

**Características:**
- Auto-load ao montar o componente
- Estado de loading integrado
- Métodos `add`, `update`, `remove` e `reload`
- Conversão automática entre formato da aplicação e formato do DB

## Mudanças Implementadas

### App.tsx

**Antes:**
```typescript
const [language, setLanguage] = useKV<Language>('app-language', 'en')
const [transactions, setTransactions] = useKV<Transaction[]>(`transactions-${monthKey}`, [])
const [bills, setBills] = useKV<Bill[]>('bills', [])
const [goals, setGoals] = useKV<Goal[]>('goals', [])
```

**Depois:**
```typescript
const { language, setLanguage: setStorageLanguage } = useLanguageSetting()
const { transactions, add: addTransaction, remove: removeTransaction } = useTransactions(monthKey)
const { bills, add: addBill, update: updateBill } = useBills()
const { goals, add: addGoal } = useGoals()
```

**Mudanças nos handlers:**
- Substituídas chamadas `setTransactions/setBills/setGoals` por métodos dos hooks
- Funções agora são assíncronas (mas sem necessidade de await na UI)
- Remoção da lógica de atualização manual de arrays

### Componentes

**Nenhuma mudança necessária** nos componentes de Dashboard e Modals, pois:
- Recebem dados via props (não usavam useKV diretamente)
- A interface permanece a mesma
- Os tipos não mudaram

## Compatibilidade

### Tipos
Os tipos existentes em `src/lib/types.ts` foram mantidos:
- `Transaction`, `Bill`, `Goal` permanecem inalterados
- Hooks fazem conversão automática entre tipos da app e tipos do DB

### IDs
- Aplicação usa `string` para IDs
- Dexie usa `number` (auto-incremento)
- Conversão transparente nos helpers

## Migração de Dados

⚠️ **Nota**: Dados existentes em `useKV` não são migrados automaticamente.

Para preservar dados existentes:
1. Usuários precisarão re-adicionar transações, ou
2. Implementar script de migração (futuro trabalho)

## Testes

✅ Build bem-sucedido com TypeScript
✅ Sem erros de importação
✅ Tipos corretos em toda aplicação

### Para testar manualmente:
1. `npm install`
2. `npm run dev`
3. Adicionar transações, contas e metas
4. Navegar entre meses
5. Mudar idioma
6. Verificar persistência ao recarregar página

## Próximos Passos

- [ ] Implementar script de migração de dados useKV → Dexie
- [ ] Adicionar testes unitários para hooks
- [ ] Implementar sincronização com backend (Sync Engine)
- [ ] Adicionar suporte para múltiplas contas
- [ ] Implementar backup/restore de dados
- [ ] Adicionar logging e observabilidade

## Dependências Adicionadas

- `dexie@^4.0.15`: Biblioteca wrapper para IndexedDB

## Arquivos Modificados

- `.gitignore`: Removida entrada `packages` para permitir workspace packages
- `tsconfig.json`: Adicionado path mapping para `@financeai/infra-db`
- `package.json`: Adicionada dependência `dexie`
- `src/App.tsx`: Migrado de useKV para hooks customizados
- **Novos arquivos:**
  - `packages/infra-db/package.json`
  - `packages/infra-db/src/index.ts`
  - `src/hooks/use-storage.ts`
  - `docs/migration-dexie.md` (este arquivo)
