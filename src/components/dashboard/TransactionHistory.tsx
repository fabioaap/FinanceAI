import { useState, useMemo } from 'react'
import { Transaction, CategoryType } from '@/lib/types'
import { getCategoryInfo, formatCurrency, formatDate } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, ArrowUp, ArrowDown, Trash } from '@phosphor-icons/react'
import * as Icons from '@phosphor-icons/react'
import { Language, Translations } from '@/lib/i18n'
import { useTransactions } from '@/hooks/useTransactions'

interface TransactionHistoryProps {
  transactions?: Transaction[]
  onDeleteTransaction?: (id: string) => void
  language: Language
  translations: Translations
  currentMonth?: Date
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
type FilterType = 'all' | 'income' | 'expense'

export function TransactionHistory({ transactions: transactionsProp, onDeleteTransaction, language, translations, currentMonth }: TransactionHistoryProps) {
  const { transactions: transactionsFromDB } = useTransactions(currentMonth)
  const transactions = transactionsProp ?? transactionsFromDB
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        default:
          return 0
      }
    })

    return sorted
  }, [transactions, filterType, sortBy, selectedCategory, searchTerm])

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const getCategoryIcon = (category: string) => {
    const categoryInfo = getCategoryInfo(category as CategoryType, translations.categories[category as CategoryType])
    const iconName = categoryInfo?.icon || 'Receipt'
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>
    return IconComponent ? <IconComponent size={20} weight="duotone" /> : null
  }

  const categories: CategoryType[] = ['shopping', 'home', 'transport', 'food', 'health', 'work', 'education', 'entertainment', 'other']

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.transactions.title}</CardTitle>
        <CardDescription>
          {language === 'pt-BR' ? 'Visualize e gerencie todas as suas transações' : 'View and manage all your transactions'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{language === 'pt-BR' ? 'Total de Receitas' : 'Total Income'}</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatCurrency(totalIncome, language)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{language === 'pt-BR' ? 'Total de Despesas' : 'Total Expenses'}</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalExpense, language)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{language === 'pt-BR' ? 'Saldo Líquido' : 'Net Balance'}</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  {formatCurrency(totalIncome - totalExpense, language)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              size={20}
            />
            <Input
              placeholder={language === 'pt-BR' ? 'Buscar transações...' : 'Search transactions...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">{language === 'pt-BR' ? 'Todos' : 'All'}</TabsTrigger>
                <TabsTrigger value="income">{translations.transactions.income}</TabsTrigger>
                <TabsTrigger value="expense">{translations.transactions.expense}</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={translations.transactions.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'pt-BR' ? 'Todas as Categorias' : 'All Categories'}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {translations.categories[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={language === 'pt-BR' ? 'Ordenar por' : 'Sort by'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{language === 'pt-BR' ? 'Mais Recentes' : 'Newest First'}</SelectItem>
                <SelectItem value="date-asc">{language === 'pt-BR' ? 'Mais Antigas' : 'Oldest First'}</SelectItem>
                <SelectItem value="amount-desc">{language === 'pt-BR' ? 'Maior Valor' : 'Highest Amount'}</SelectItem>
                <SelectItem value="amount-asc">{language === 'pt-BR' ? 'Menor Valor' : 'Lowest Amount'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{translations.transactions.noTransactions}</p>
            </div>
          ) : (
            filteredAndSortedTransactions.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category, translations.categories[transaction.category])
              return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${categoryInfo?.color}20` }}
                  >
                    <div style={{ color: categoryInfo?.color }}>
                      {getCategoryIcon(transaction.category)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {categoryInfo?.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date, language)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {transaction.type === 'income' ? (
                        <ArrowUp size={16} weight="bold" className="text-secondary" />
                      ) : (
                        <ArrowDown size={16} weight="bold" className="text-destructive" />
                      )}
                      <span 
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-secondary' : 'text-destructive'
                        }`}
                      >
                        {formatCurrency(transaction.amount, language)}
                      </span>
                    </div>
                  </div>

                  {onDeleteTransaction && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash size={16} weight="bold" />
                    </Button>
                  )}
                </div>
              </div>
            )})
          )}
        </div>

        {filteredAndSortedTransactions.length > 0 && (
          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            {language === 'pt-BR' 
              ? `Mostrando ${filteredAndSortedTransactions.length} de ${transactions.length} transações`
              : `Showing ${filteredAndSortedTransactions.length} of ${transactions.length} transactions`
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}
