import { useState } from 'react';
import { settingsRepository } from '../lib/db';

/**
 * Hook para gerenciar configurações da aplicação
 */
export function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSetting = async <T,>(key: string): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      return await settingsRepository.get<T>(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar configuração';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setSetting = async <T,>(key: string, value: T) => {
    setIsLoading(true);
    setError(null);
    try {
      await settingsRepository.set(key, value);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar configuração';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSetting = async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await settingsRepository.delete(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar configuração';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await settingsRepository.getAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar configurações';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getSetting,
    setSetting,
    deleteSetting,
    getAllSettings,
  };
}
