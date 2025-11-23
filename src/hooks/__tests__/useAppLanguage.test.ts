import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAppLanguage } from '../useAppLanguage'
import { db } from '@/database/db'

describe('useAppLanguage', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.settings.clear()
  })

  it('should default to English', async () => {
    const { result } = renderHook(() => useAppLanguage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.language).toBe('en')
    expect(result.current.error).toBeNull()
  })

  it('should set language to Portuguese', async () => {
    const { result } = renderHook(() => useAppLanguage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.setLanguage('pt-BR')

    await waitFor(() => {
      expect(result.current.language).toBe('pt-BR')
    })
  })

  it('should persist language setting', async () => {
    // First hook instance sets language
    const { result: result1 } = renderHook(() => useAppLanguage())

    await waitFor(() => {
      expect(result1.current.loading).toBe(false)
    })

    await result1.current.setLanguage('pt-BR')

    await waitFor(() => {
      expect(result1.current.language).toBe('pt-BR')
    })

    // Second hook instance should read persisted language
    const { result: result2 } = renderHook(() => useAppLanguage())

    await waitFor(() => {
      expect(result2.current.loading).toBe(false)
    })

    expect(result2.current.language).toBe('pt-BR')
  })

  it('should change language back and forth', async () => {
    const { result } = renderHook(() => useAppLanguage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Set to Portuguese
    await result.current.setLanguage('pt-BR')

    await waitFor(() => {
      expect(result.current.language).toBe('pt-BR')
    })

    // Set back to English
    await result.current.setLanguage('en')

    await waitFor(() => {
      expect(result.current.language).toBe('en')
    })
  })

  it('should handle refresh', async () => {
    const { result } = renderHook(() => useAppLanguage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.setLanguage('pt-BR')

    await waitFor(() => {
      expect(result.current.language).toBe('pt-BR')
    })

    await result.current.refresh()

    await waitFor(() => {
      expect(result.current.language).toBe('pt-BR')
    })
  })
})
