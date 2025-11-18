import { CategoryType, CategoryInfo } from './types'

export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  shopping: {
    name: 'Shopping',
    icon: 'ShoppingCart',
    color: 'oklch(0.65 0.15 300)',
  },
  home: {
    name: 'Home',
    icon: 'House',
    color: 'oklch(0.60 0.15 40)',
  },
  transport: {
    name: 'Transport',
    icon: 'Car',
    color: 'oklch(0.55 0.15 220)',
  },
  food: {
    name: 'Food & Dining',
    icon: 'Coffee',
    color: 'oklch(0.65 0.15 60)',
  },
  health: {
    name: 'Health',
    icon: 'HeartPulse',
    color: 'oklch(0.60 0.15 10)',
  },
  work: {
    name: 'Work',
    icon: 'Briefcase',
    color: 'oklch(0.50 0.15 250)',
  },
  education: {
    name: 'Education',
    icon: 'GraduationCap',
    color: 'oklch(0.55 0.15 280)',
  },
  entertainment: {
    name: 'Entertainment',
    icon: 'Gamepad',
    color: 'oklch(0.65 0.15 340)',
  },
  other: {
    name: 'Other',
    icon: 'Receipt',
    color: 'oklch(0.60 0.05 250)',
  },
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
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
