import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction, CategoryType } from '@/lib/types'
import { CATEGORIES, formatCurrency } from '@/lib/constants'
import { ChartPie } from '@phosphor-icons/react'

interface CategoryBreakdownProps {
  transactions: Transaction[]
}

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const categoryTotals = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {} as Record<CategoryType, number>)

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  if (sortedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartPie size={20} weight="bold" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses yet this month</p>
            <p className="text-sm mt-2">Add your first expense to see insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartPie size={20} weight="bold" />
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedCategories.map(([category, amount]) => {
          const categoryInfo = CATEGORIES[category as CategoryType]
          const percentage = (amount / totalExpenses) * 100

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{categoryInfo.name}</span>
                <span className="font-mono text-muted-foreground">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: categoryInfo.color,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}% of total expenses
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
