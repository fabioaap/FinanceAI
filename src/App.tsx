import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Transaction, Bill, Goal } from '@/lib/types'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { UpcomingBills } from '@/components/dashboard/UpcomingBills'
import { SavingsGoals } from '@/components/dashboard/SavingsGoals'
import { AIInsights } from '@/components/dashboard/AIInsights'
import { TransactionHistory } from '@/components/dashboard/TransactionHistory'
import { AddTransactionModal } from '@/components/modals/AddTransactionModal'
import { AddBillModal } from '@/components/modals/AddBillModal'
import { AddGoalModal } from '@/components/modals/AddGoalModal'
import { SettingsModal } from '@/components/modals/SettingsModal'
import { Button } from '@/components/ui/button'
import { Plus, CaretLeft, CaretRight, ClockCounterClockwise, House, Gear } from '@phosphor-icons/react'
import { formatMonthYear, getMonthKey } from '@/lib/constants'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Language, getTranslation } from '@/lib/i18n'

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthKey = getMonthKey(currentMonth)

  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  const t = getTranslation(language || 'en')

  const [transactions, setTransactions] = useKV<Transaction[]>(`transactions-${monthKey}`, [])
  const [bills, setBills] = useKV<Bill[]>('bills', [])
  const [goals, setGoals] = useKV<Goal[]>('goals', [])

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const income = (transactions || [])
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = (transactions || [])
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions((current) => [...(current || []), transaction])
  }

  const handleAddBill = (bill: Bill) => {
    setBills((current) => [...(current || []), bill])
  }

  const handleAddGoal = (goal: Goal) => {
    setGoals((current) => [...(current || []), goal])
  }

  const handleToggleBillPaid = (billId: string) => {
    setBills((current) =>
      (current || []).map((bill) =>
        bill.id === billId
          ? { ...bill, status: bill.status === 'paid' ? 'pending' : 'paid' as const }
          : bill
      )
    )
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions((current) =>
      (current || []).filter((t) => t.id !== transactionId)
    )
    toast.success(t.transactions.deleted)
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    toast.success(
      newLanguage === 'pt-BR' 
        ? 'Idioma alterado para Português (Brasil)' 
        : 'Language changed to English'
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.app.title}</h1>
            <p className="text-muted-foreground">{t.app.subtitle}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Gear size={20} weight="bold" />
            </Button>
            
            <Button
              variant={showHistory ? "default" : "outline"}
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              {showHistory ? (
                <>
                  <House size={20} weight="bold" />
                  {t.navigation.dashboard}
                </>
              ) : (
                <>
                  <ClockCounterClockwise size={20} weight="bold" />
                  {t.navigation.history}
                </>
              )}
            </Button>
          </div>
        </header>

        {showHistory ? (
          <TransactionHistory 
            transactions={transactions || []} 
            onDeleteTransaction={handleDeleteTransaction}
            language={language || 'en'}
            translations={t}
          />
        ) : (
          <>
            <div className="flex items-center justify-between bg-card rounded-lg p-4 border">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <CaretLeft size={20} weight="bold" />
              </Button>
              <h2 className="text-2xl font-semibold">
                {formatMonthYear(currentMonth, language || 'en')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
              >
                <CaretRight size={20} weight="bold" />
              </Button>
            </div>

            <SummaryCards 
              income={income} 
              expenses={expenses} 
              balance={balance}
              language={language || 'en'}
              translations={t}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdown 
                transactions={transactions || []}
                language={language || 'en'}
                translations={t}
              />
              <AIInsights 
                transactions={transactions || []} 
                currentMonth={currentMonth}
                language={language || 'en'}
                translations={t}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingBills
                bills={bills || []}
                onAddBill={() => setShowAddBill(true)}
                onTogglePaid={handleToggleBillPaid}
                language={language || 'en'}
                translations={t}
              />
              <SavingsGoals
                goals={goals || []}
                onAddGoal={() => setShowAddGoal(true)}
                language={language || 'en'}
                translations={t}
              />
            </div>
          </>
        )}

        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddTransaction(true)}
        >
          <Plus size={24} weight="bold" />
        </Button>
      </div>

      <AddTransactionModal
        open={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onAdd={handleAddTransaction}
        language={language || 'en'}
        translations={t}
      />

      <AddBillModal
        open={showAddBill}
        onClose={() => setShowAddBill(false)}
        onAdd={handleAddBill}
        language={language || 'en'}
        translations={t}
      />

      <AddGoalModal
        open={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAdd={handleAddGoal}
        language={language || 'en'}
        translations={t}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        language={language || 'en'}
        onLanguageChange={handleLanguageChange}
        translations={t}
      />

      <Toaster />
    </div>
  )
}

export default App