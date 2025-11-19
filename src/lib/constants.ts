import { CategoryType, CategoryInfo } from './types'
import { Language } from './i18n'

export const getCategoryInfo = (category: CategoryType, categoryName: string): CategoryInfo => {
  const categoryData: Record<CategoryType, Omit<CategoryInfo, 'name'>> = {
    shopping: {
      icon: 'ShoppingCart',
      color: 'oklch(0.65 0.15 300)',
    },
    home: {
      icon: 'House',
      color: 'oklch(0.60 0.15 40)',
    },
    transport: {
      icon: 'Car',
      color: 'oklch(0.55 0.15 220)',
    },
    food: {
      icon: 'Coffee',
      color: 'oklch(0.65 0.15 60)',
    },
    health: {
      icon: 'HeartPulse',
      color: 'oklch(0.60 0.15 10)',
    },
    work: {
      icon: 'Briefcase',
      color: 'oklch(0.50 0.15 250)',
    },
    education: {
      icon: 'GraduationCap',
      color: 'oklch(0.55 0.15 280)',
    },
    entertainment: {
      icon: 'Gamepad',
      color: 'oklch(0.65 0.15 340)',
    },
    other: {
      icon: 'Receipt',
      color: 'oklch(0.60 0.05 250)',
    },
  }
  
  return {
    ...categoryData[category],
    name: categoryName,
  }
}

export const formatCurrency = (amount: number, language: Language): string => {
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US'
  const currency = language === 'pt-BR' ? 'BRL' : 'USD'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date: string, language: Language): string => {
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US'
  
  return new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatMonthYear = (date: Date, language: Language): string => {
  const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US'
  
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
