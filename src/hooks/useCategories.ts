import { useMemo } from 'react';
import { CategoryType } from '@/lib/types';
import { getCategoryInfo } from '@/lib/constants';
import { useTransactions } from './useTransactions';

export interface CategoryData {
  category: CategoryType;
  name: string;
  icon: string;
  color: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

interface UseCategoriesResult {
  categories: CategoryData[];
  getCategoryByType: (category: CategoryType) => CategoryData | undefined;
  totalExpenses: number;
  loading: boolean;
}

// Category name translations
const categoryNames: Record<CategoryType, string> = {
  shopping: 'Shopping',
  home: 'Home',
  transport: 'Transport',
  food: 'Food',
  health: 'Health',
  work: 'Work',
  education: 'Education',
  entertainment: 'Entertainment',
  other: 'Other',
};

/**
 * Custom hook to manage and analyze transaction categories
 * @returns Object with category data and helper functions
 */
export function useCategories(): UseCategoriesResult {
  const { transactions, loading } = useTransactions();

  // Calculate category statistics
  const categories = useMemo(() => {
    // Filter only expense transactions for category analysis
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Calculate total expenses
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Group transactions by category
    const categoryMap = new Map<CategoryType, { amount: number; count: number }>();

    expenseTransactions.forEach(transaction => {
      const category = transaction.category as CategoryType;
      const current = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: current.amount + transaction.amount,
        count: current.count + 1,
      });
    });

    // Convert to CategoryData array
    const categoryDataArray: CategoryData[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => {
        const categoryInfo = getCategoryInfo(category, categoryNames[category]);
        return {
          category,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          color: categoryInfo.color,
          totalAmount: data.amount,
          transactionCount: data.count,
          percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        };
      }
    );

    // Sort by total amount (descending)
    return categoryDataArray.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [transactions]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.totalAmount, 0);
  }, [categories]);

  // Get category by type
  const getCategoryByType = (category: CategoryType): CategoryData | undefined => {
    return categories.find(cat => cat.category === category);
  };

  return {
    categories,
    getCategoryByType,
    totalExpenses,
    loading,
  };
}
