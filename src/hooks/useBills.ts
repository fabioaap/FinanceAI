import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { billRepository, Bill } from '../lib/db';

/**
 * Hook para gerenciar contas (bills) com dados reativos do Dexie
 */
export function useBills() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live query que atualiza automaticamente quando bills mudam
  const bills = useLiveQuery(
    () => billRepository.getAll(),
    []
  );

  const addBill = async (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await billRepository.add(bill);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar conta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBill = async (id: number, changes: Partial<Bill>) => {
    setIsLoading(true);
    setError(null);
    try {
      await billRepository.update(id, changes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar conta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBill = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await billRepository.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar conta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUnpaidBills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await billRepository.getUnpaid();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar contas não pagas';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bills: bills ?? [],
    isLoading: isLoading || bills === undefined,
    error,
    addBill,
    updateBill,
    deleteBill,
    getUnpaidBills,
  };
}
