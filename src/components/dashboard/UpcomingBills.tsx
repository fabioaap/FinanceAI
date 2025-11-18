import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bill } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/constants'
import { Bell, Plus } from '@phosphor-icons/react'
import { Language, Translations } from '@/lib/i18n'

interface UpcomingBillsProps {
  bills: Bill[]
  onAddBill: () => void
  onTogglePaid: (billId: string) => void
  language: Language
  translations: Translations
}

export function UpcomingBills({ bills, onAddBill, onTogglePaid, language, translations }: UpcomingBillsProps) {
  const upcomingBills = bills
    .filter((bill) => bill.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} weight="bold" />
            {translations.bills.title}
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onAddBill}>
            <Plus size={16} weight="bold" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingBills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{translations.bills.noBills}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{bill.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {translations.bills.dueDate} {formatDate(bill.dueDate, language)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium">
                    {formatCurrency(bill.amount, language)}
                  </span>
                  <Badge
                    variant={bill.status === 'overdue' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {translations.bills[bill.status]}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTogglePaid(bill.id)}
                  >
                    {bill.status === 'paid' ? translations.bills.markAsUnpaid : translations.bills.markAsPaid}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
