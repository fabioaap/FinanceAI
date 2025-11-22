import { useState, useEffect, useCallback } from 'react';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { Category } from '@/types';

export const useCategories = (type?: 'income' | 'expense') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = type
        ? await categoryRepository.getByType(type)
        : await categoryRepository.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const exists = await categoryRepository.exists(category.name);
      if (exists) {
        throw new Error('Category with this name already exists');
      }
      await categoryRepository.create(category);
      await loadCategories();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create category');
    }
  }, [loadCategories]);

  const updateCategory = useCallback(async (id: number, category: Partial<Category>) => {
    try {
      await categoryRepository.update(id, category);
      await loadCategories();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update category');
    }
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await categoryRepository.delete(id);
      await loadCategories();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete category');
    }
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
};
