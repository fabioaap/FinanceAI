import { useState, useEffect, useCallback } from 'react'
import { settingsRepository } from '@/repositories/SettingsRepository'
import { Language } from '@/lib/types'

const LANGUAGE_KEY = 'app-language'

export function useAppLanguage() {
  const [language, setLanguageState] = useState<Language>('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadLanguage = useCallback(async () => {
    try {
      setLoading(true)
      const storedLanguage = await settingsRepository.getSetting(LANGUAGE_KEY)
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'pt-BR')) {
        setLanguageState(storedLanguage as Language)
      } else {
        setLanguageState('en')
      }
      setError(null)
    } catch (err) {
      console.error('Failed to load language:', err)
      setError(err instanceof Error ? err : new Error('Failed to load language'))
      setLanguageState('en')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLanguage()
  }, [loadLanguage])

  const setLanguage = useCallback(async (newLanguage: Language) => {
    try {
      await settingsRepository.setSetting(LANGUAGE_KEY, newLanguage)
      setLanguageState(newLanguage)
      setError(null)
    } catch (err) {
      console.error('Failed to save language:', err)
      throw err instanceof Error ? err : new Error('Failed to save language')
    }
  }, [])

  return {
    language,
    loading,
    error,
    setLanguage,
    refresh: loadLanguage,
  }
}
