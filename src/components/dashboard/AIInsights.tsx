import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkle } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { Transaction } from '@/lib/types'
import { formatCurrency } from '@/lib/constants'

interface AIInsightsProps {
  transactions: Transaction[]
  currentMonth: Date
}

export function AIInsights({ transactions, currentMonth }: AIInsightsProps) {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (transactions.length >= 3) {
      generateInsights()
    }
  }, [transactions.length])

  const generateInsights = async () => {
    setLoading(true)
    
    const expenses = transactions.filter(t => t.type === 'expense')
    const income = transactions.filter(t => t.type === 'income')
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    
    const categoryBreakdown = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)[0]

    const promptText = `You are a friendly financial advisor. Based on this month's financial data, provide 2-3 short, actionable insights in a conversational tone. Keep each insight to 1-2 sentences.

Financial Summary:
- Total Income: ${formatCurrency(totalIncome)}
- Total Expenses: ${formatCurrency(totalExpenses)}
- Balance: ${formatCurrency(totalIncome - totalExpenses)}
- Top Spending Category: ${topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : 'None'}
- Number of Transactions: ${transactions.length}

Return your response as a JSON object with a single "insights" property containing an array of insight strings.`

    try {
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const parsed = JSON.parse(response)
      setInsights(parsed.insights || [])
    } catch (error) {
      console.error('Failed to generate insights:', error)
      setInsights(['Keep tracking your expenses to unlock personalized insights!'])
    } finally {
      setLoading(false)
    }
  }

  if (transactions.length < 3) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle size={20} weight="fill" className="text-accent" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add at least 3 transactions to unlock personalized AI insights about your spending patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={20} weight="fill" className="text-accent" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          </div>
        ) : (
          insights.map((insight, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{insight}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
