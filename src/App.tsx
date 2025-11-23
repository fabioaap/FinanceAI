import { useState, useEffect } from 'react'
import { Transaction, Bill, Goal } from '@/lib/types'
import { useAppTransactions, useBills, useGoals, useAppLanguage } from '@/hooks'
import { migrateLocalStorageToDexie } from '@/lib/migrate-local-storage'
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
import { ImportBankFileModal } from '@/components/modals/ImportBankFileModal'
import { CategoryMappingModal } from '@/components/modals/CategoryMappingModal'
import { Button } from '@/components/ui/button'
import { Plus, CaretLeft, CaretRight, ClockCounterClockwise, House, Gear, Upload } from '@phosphor-icons/react'
import { formatMonthYear, getMonthKey } from '@/lib/constants'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Language, getTranslation } from '@/lib/i18n'

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthKey = getMonthKey(currentMonth)
  const [migrationComplete, setMigrationComplete] = useState(false)

  // Run migration on mount
  useEffect(() => {
    let mounted = true

    async function runMigration() {
      try {
        const result = await migrateLocalStorageToDexie()
        if (mounted) {
          if (result.success) {
            const { bills, goals, language } = result.migrated
            if (bills > 0 || goals > 0 || language) {
              console.log('Migration completed:', result.migrated)
            }
          } else {
            console.error('Migration failed:', result.error)
          }
          setMigrationComplete(true)
        }
      } catch (error) {
        console.error('Migration error:', error)
        if (mounted) {
          setMigrationComplete(true)
        }
      }
    }

    runMigration()

    return () => {
      mounted = false
    }
  }, [])

  // 🚀 NEW: Use Dexie-backed hooks
  const { language, loading: languageLoading, setLanguage } = useAppLanguage()
  const { transactions, loading: transactionsLoading, addTransaction, removeTransaction } = useAppTransactions(monthKey)
  const { bills, loading: billsLoading, addBill, removeBill, updateBill } = useBills()
  const { goals, loading: goalsLoading, addGoal, removeGoal, updateGoal } = useGoals()

  const t = getTranslation(language || 'en')

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showImportFile, setShowImportFile] = useState(false)
  const [showCategoryMapping, setShowCategoryMapping] = useState(false)

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

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await addTransaction(transaction)
      toast.success(t.transactions.added)
    } catch (error) {
      toast.error(
        language === 'pt-BR'
          ? 'Erro ao adicionar transação'
          : 'Failed to add transaction'
      )
    }
  }

  const handleAddBill = async (bill: Bill) => {
    try {
      await addBill(bill)
      toast.success(
        language === 'pt-BR'
          ? 'Conta adicionada com sucesso'
          : 'Bill added successfully'
      )
    } catch (error) {
      toast.error(
        language === 'pt-BR'
          ? 'Erro ao adicionar conta'
          : 'Failed to add bill'
      )
    }
  }

  const handleAddGoal = async (goal: Goal) => {
    try {
      await addGoal(goal)
      toast.success(
        language === 'pt-BR'
          ? 'Meta adicionada com sucesso'
          : 'Goal added successfully'
      )
    } catch (error) {
      toast.error(
        language === 'pt-BR'
          ? 'Erro ao adicionar meta'
          : 'Failed to add goal'
      )
    }
  }

  const handleToggleBillPaid = async (billId: string) => {
    try {
      const bill = bills.find(b => b.id === billId)
      if (bill) {
        await updateBill(billId, {
          status: bill.status === 'paid' ? 'pending' : 'paid'
        })
        toast.success(
          language === 'pt-BR'
            ? 'Status da conta atualizado'
            : 'Bill status updated'
        )
      }
    } catch (error) {
      toast.error(
        language === 'pt-BR'
          ? 'Erro ao atualizar conta'
          : 'Failed to update bill'
      )
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await removeTransaction(transactionId)
      toast.success(t.transactions.deleted)
    } catch (error) {
      toast.error(
        language === 'pt-BR'
          ? 'Erro ao excluir transação'
          : 'Failed to delete transaction'
      )
    }
  }

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await setLanguage(newLanguage)
      toast.success(
        newLanguage === 'pt-BR'
          ? 'Idioma alterado para Português (Brasil)'
          : 'Language changed to English'
      )
    } catch (error) {
      toast.error(
        newLanguage === 'pt-BR'
          ? 'Erro ao alterar idioma'
          : 'Failed to change language'
      )
    }
  }

  const handleImportComplete = async (importedTransactions: Transaction[]) => {
    try {
      // Adiciona todas as transações importadas via Dexie
      for (const transaction of importedTransactions) {
        await addTransaction(transaction)
      }
      toast.success(
        language === 'pt-BR'
          ? `${importedTransactions.length} transações importadas com sucesso!`
          : `${importedTransactions.length} transactions imported successfully!`
      )
      setShowImportFile(false)
    } catch (error) {
      toast.error(
        language === 'pt-BR'
          ? 'Erro ao importar transações'
          : 'Failed to import transactions'
      )
    }
  }

  // Loading state durante carregamento inicial do Dexie e migração
  if (!migrationComplete || languageLoading || transactionsLoading || billsLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === 'pt-BR' ? 'Carregando...' : 'Loading...'}
          </p>
        </div>
      </div>
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
              variant="outline"
              onClick={() => setShowImportFile(true)}
              className="gap-2"
            >
              <Upload size={20} weight="bold" />
              {t.navigation.import || (language === 'pt-BR' ? 'Importar Extrato' : 'Import Statement')}
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
        onOpenCategoryMapping={() => {
          setShowSettings(false)
          setShowCategoryMapping(true)
        }}
        translations={t}
      />

      <ImportBankFileModal
        open={showImportFile}
        onOpenChange={setShowImportFile}
        onImportComplete={handleImportComplete}
      />

      <CategoryMappingModal
        open={showCategoryMapping}
        onOpenChange={setShowCategoryMapping}
      />

      <Toaster />
    </div>
  )
}

export default App
