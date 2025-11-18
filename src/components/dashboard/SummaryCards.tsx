import { Card, CardContent } from '@/components/ui/card'
import { TrendUp, TrendDown, CurrencyDollar } from '@phosphor-icons/react'
import { formatCurrency } from '@/lib/constants'

interface SummaryCardsProps {
  income: number
  expenses: number
  balance: number
}

export function SummaryCards({ income, expenses, balance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Income
            </span>
            <TrendUp className="text-secondary" size={20} weight="bold" />
          </div>
          <p className="text-3xl font-mono font-medium text-foreground tabular-nums">
            {formatCurrency(income)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Expenses
            </span>
            <TrendDown className="text-destructive" size={20} weight="bold" />
          </div>
          <p className="text-3xl font-mono font-medium text-foreground tabular-nums">
            {formatCurrency(expenses)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Balance
            </span>
            <CurrencyDollar className="text-primary" size={20} weight="bold" />
          </div>
          <p className={`text-3xl font-mono font-medium tabular-nums ${
            balance >= 0 ? 'text-secondary' : 'text-destructive'
          }`}>
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
