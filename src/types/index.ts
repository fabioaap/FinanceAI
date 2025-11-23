export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id?: number;
  categoryId: number;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id?: number;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  id?: number;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  recurrence?: 'once' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id?: number;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  type: 'savings' | 'debt' | 'reserve';
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
