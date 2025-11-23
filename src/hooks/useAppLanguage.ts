import { useState, useEffect, useCallback } from 'react';
import { settingsRepository } from '@/repositories/SettingsRepository';

export type Language = 'en' | 'pt-BR';

const LANGUAGE_KEY = 'app-language';

export const useAppLanguage = () => {
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLanguage = useCallback(async () => {
    try {
      setLoading(true);
      const setting = await settingsRepository.getByKey(LANGUAGE_KEY);
      if (setting) {
        setLanguageState(setting.value as Language);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load language'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const setLanguage = useCallback(async (newLanguage: Language) => {
    try {
      await settingsRepository.setByKey(LANGUAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to set language');
    }
  }, []);

  return {
    language,
    setLanguage,
    loading,
    error,
  };
};
