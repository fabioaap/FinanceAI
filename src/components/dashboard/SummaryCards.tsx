import { Card, CardContent } from '@/components/ui/card'
import { TrendUp, TrendDown, CurrencyDollar } from '@phosphor-icons/react'
import { formatCurrency } from '@/lib/constants'
import { Language, Translations } from '@/lib/i18n'

interface SummaryCardsProps {
  income: number
  expenses: number
  balance: number
  language: Language
  translations: Translations
}

export function SummaryCards({ income, expenses, balance, language, translations }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {translations.summary.income}
            </span>
            <TrendUp className="text-secondary" size={20} weight="bold" />
          </div>
          <p className="text-3xl font-mono font-medium text-foreground tabular-nums">
            {formatCurrency(income, language)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {translations.summary.expenses}
            </span>
            <TrendDown className="text-destructive" size={20} weight="bold" />
          </div>
          <p className="text-3xl font-mono font-medium text-foreground tabular-nums">
            {formatCurrency(expenses, language)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {translations.summary.balance}
            </span>
            <CurrencyDollar className="text-primary" size={20} weight="bold" />
          </div>
          <p className={`text-3xl font-mono font-medium tabular-nums ${
            balance >= 0 ? 'text-secondary' : 'text-destructive'
          }`}>
            {formatCurrency(balance, language)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
