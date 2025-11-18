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
import { Button } from '@/components/ui/button'
import { Plus, CaretLeft, CaretRight, ClockCounterClockwise, House } from '@phosphor-icons/react'
import { formatMonthYear, getMonthKey } from '@/lib/constants'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthKey = getMonthKey(currentMonth)

  const [transactions, setTransactions] = useKV<Transaction[]>(`transactions-${monthKey}`, [])
  const [bills, setBills] = useKV<Bill[]>('bills', [])
  const [goals, setGoals] = useKV<Goal[]>('goals', [])

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

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
    toast.success('Transaction deleted')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FinanceAI</h1>
            <p className="text-muted-foreground">Personal Finance Dashboard</p>
          </div>
          
          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            {showHistory ? (
              <>
                <House size={20} weight="bold" />
                Dashboard
              </>
            ) : (
              <>
                <ClockCounterClockwise size={20} weight="bold" />
                History
              </>
            )}
          </Button>
        </header>

        {showHistory ? (
          <TransactionHistory 
            transactions={transactions || []} 
            onDeleteTransaction={handleDeleteTransaction}
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
                {formatMonthYear(currentMonth)}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
              >
                <CaretRight size={20} weight="bold" />
              </Button>
            </div>

            <SummaryCards income={income} expenses={expenses} balance={balance} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdown transactions={transactions || []} />
              <AIInsights transactions={transactions || []} currentMonth={currentMonth} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingBills
                bills={bills || []}
                onAddBill={() => setShowAddBill(true)}
                onTogglePaid={handleToggleBillPaid}
              />
              <SavingsGoals
                goals={goals || []}
                onAddGoal={() => setShowAddGoal(true)}
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
      />

      <AddBillModal
        open={showAddBill}
        onClose={() => setShowAddBill(false)}
        onAdd={handleAddBill}
      />

      <AddGoalModal
        open={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAdd={handleAddGoal}
      />

      <Toaster />
    </div>
  )
}

export default App