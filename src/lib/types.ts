export type TransactionType = 'income' | 'expense'

export type CategoryType =
  | 'shopping'
  | 'home'
  | 'transport'
  | 'food'
  | 'health'
  | 'work'
  | 'education'
  | 'entertainment'
  | 'other'

export interface Transaction {
  id: string
  amount: number
  description: string
  category: CategoryType
  type: TransactionType
  date: string
  createdAt: string
}

export interface Bill {
  id: string
  description: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  recurrence?: 'once' | 'weekly' | 'monthly' | 'yearly'
  createdAt: string
}

export interface Goal {
  id: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  type: 'savings' | 'debt' | 'reserve'
  createdAt: string
}

export interface CategoryInfo {
  name: string
  icon: string
  color: string
}

// Tipos para upload de arquivos bancários
export type BankFileFormat = 'csv' | 'ofx' | 'txt'

export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: TransactionType
  category?: CategoryType
  balance?: number
}

export interface BankFileParseResult {
  success: boolean
  transactions: ParsedTransaction[]
  errors: string[]
  fileName: string
  format: BankFileFormat
  totalParsed: number
}

export interface BankFileUploadConfig {
  acceptedFormats: BankFileFormat[]
  maxFileSizeMB: number
  autoDetectFormat: boolean
}
