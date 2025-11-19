# Dexie Schema - FinanceAI

Pacote: `@financeai/infra-db`

Versão: 1

Tabelas:

- transactions: ++id, date, amount, categoryId, accountId
  - fields: id, amount, description, date, categoryId, accountId, type, createdAt, updatedAt

- categories: ++id, name, type
  - fields: id, name, type, createdAt, updatedAt

- bills: ++id, dueDate, name
  - fields: id, name, amount, dueDate, recurring, createdAt, updatedAt

- goals: ++id, name, targetAmount
  - fields: id, name, targetAmount, currentAmount, dueDate, createdAt, updatedAt

Uso:

- Importe do pacote via: `import { db, addTransaction } from '@financeai/infra-db'`
- Crie hooks em `src/hooks` para encapsular consultas e chamadas de escrita.

Próximos passos:
- Adicionar sincronização com nuvem (Sync Engine)
- Migrar `useKV` para Dexie e criar adaptador de migração para dados existentes
- Implementar observabilidade e testes para operações de escrita e leitura
