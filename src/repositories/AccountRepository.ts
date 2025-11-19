import { BaseRepository } from './BaseRepository';
import { Account } from '@/types';
import { db } from '@/database/db';

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super(db.accounts);
  }

  async getByType(type: 'checking' | 'savings' | 'credit' | 'investment'): Promise<Account[]> {
    return await this.table.where('type').equals(type).toArray();
  }

  async getTotalBalance(accountType?: 'checking' | 'savings' | 'credit' | 'investment'): Promise<number> {
    const accounts = accountType 
      ? await this.getByType(accountType)
      : await this.getAll();
    
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  async updateBalance(id: number, newBalance: number): Promise<number> {
    return await this.update(id, { balance: newBalance } as Partial<Account>);
  }
}

export const accountRepository = new AccountRepository();
