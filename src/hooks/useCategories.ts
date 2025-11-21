import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { categoryRepository, Category } from '../lib/db';

/**
 * Hook para gerenciar categorias com dados reativos do Dexie
 */
export function useCategories() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live query que atualiza automaticamente quando categorias mudam
  const categories = useLiveQuery(
    () => categoryRepository.getAll(),
    []
  );

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await categoryRepository.add(category);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar categoria';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: number, changes: Partial<Category>) => {
    setIsLoading(true);
    setError(null);
    try {
      await categoryRepository.update(id, changes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await categoryRepository.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar categoria';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoriesByType = async (type: 'income' | 'expense') => {
    setIsLoading(true);
    setError(null);
    try {
      return await categoryRepository.getByType(type);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar categorias';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await categoryRepository.clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar categorias';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories: categories ?? [],
    isLoading: isLoading || categories === undefined,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    clearCategories,
  };
}
