import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Goal } from '@/lib/types'
import { formatCurrency } from '@/lib/constants'
import { Target, Plus } from '@phosphor-icons/react'
import { Language, Translations } from '@/lib/i18n'

interface SavingsGoalsProps {
  goals: Goal[]
  onAddGoal: () => void
  language: Language
  translations: Translations
}

export function SavingsGoals({ goals, onAddGoal, language, translations }: SavingsGoalsProps) {
  const activeGoals = goals.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target size={20} weight="bold" />
            {translations.goals.title}
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onAddGoal}>
            <Plus size={16} weight="bold" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{translations.goals.noGoals}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal.description}</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-mono">{formatCurrency(goal.currentAmount, language)}</span>
                    <span className="font-mono">{formatCurrency(goal.targetAmount, language)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
