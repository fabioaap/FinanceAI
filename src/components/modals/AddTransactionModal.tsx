import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionType, CategoryType } from '@/lib/types'
import { generateId } from '@/lib/constants'
import { toast } from 'sonner'
import { Language, Translations } from '@/lib/i18n'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onAdd: (transaction: {
    id: string
    amount: number
    description: string
    category: CategoryType
    type: TransactionType
    date: string
    createdAt: string
  }) => void
  language: Language
  translations: Translations
}

export function AddTransactionModal({ open, onClose, onAdd, language, translations }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<CategoryType>('other')

  const categories: CategoryType[] = ['shopping', 'home', 'transport', 'food', 'health', 'work', 'education', 'entertainment', 'other']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(language === 'pt-BR' ? 'Por favor, insira um valor válido' : 'Please enter a valid amount')
      return
    }

    onAdd({
      id: generateId(),
      amount: amountNum,
      description: description || (language === 'pt-BR' ? 'Transação sem título' : 'Untitled transaction'),
      category,
      type,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })

    const successMessage = language === 'pt-BR'
      ? `${type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso`
      : `${type === 'income' ? 'Income' : 'Expense'} added successfully`
    toast.success(successMessage)
    
    setAmount('')
    setDescription('')
    setCategory('other')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{translations.transactions.addTransaction}</DialogTitle>
          <DialogDescription>
            {language === 'pt-BR' 
              ? 'Registre uma nova receita ou despesa' 
              : 'Record a new income or expense transaction'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">{translations.transactions.expense}</TabsTrigger>
              <TabsTrigger value="income">{translations.transactions.income}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">{translations.transactions.amount}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-mono"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{translations.transactions.description}</Label>
            <Input
              id="description"
              placeholder={language === 'pt-BR' ? 'Para que foi isso?' : 'What was this for?'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{translations.transactions.category}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryType)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {translations.categories[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {translations.modals.cancel}
            </Button>
            <Button type="submit">{translations.modals.add}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
