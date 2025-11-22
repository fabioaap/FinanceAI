import { useState, useEffect, useCallback } from 'react';
import { accountRepository } from '@/repositories/AccountRepository';
import { Account } from '@/types';

export const useAccounts = (type?: 'checking' | 'savings' | 'credit' | 'investment') => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = type
        ? await accountRepository.getByType(type)
        : await accountRepository.getAll();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load accounts'));
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const createAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    try {
      await accountRepository.create(account);
      await loadAccounts();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create account');
    }
  }, [loadAccounts]);

  const updateAccount = useCallback(async (id: number, account: Partial<Account>) => {
    try {
      await accountRepository.update(id, account);
      await loadAccounts();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update account');
    }
  }, [loadAccounts]);

  const deleteAccount = useCallback(async (id: number) => {
    try {
      await accountRepository.delete(id);
      await loadAccounts();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete account');
    }
  }, [loadAccounts]);

  const getTotalBalance = useCallback(async (accountType?: 'checking' | 'savings' | 'credit' | 'investment') => {
    return await accountRepository.getTotalBalance(accountType);
  }, []);

  const updateBalance = useCallback(async (id: number, newBalance: number) => {
    try {
      await accountRepository.updateBalance(id, newBalance);
      await loadAccounts();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update balance');
    }
  }, [loadAccounts]);

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance,
    updateBalance,
    refresh: loadAccounts,
  };
};
