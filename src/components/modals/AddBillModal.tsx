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
import { generateId } from '@/lib/constants'
import { toast } from 'sonner'
import { Language, Translations } from '@/lib/i18n'

interface AddBillModalProps {
  open: boolean
  onClose: () => void
  onAdd: (bill: {
    id: string
    description: string
    amount: number
    dueDate: string
    status: 'pending' | 'paid' | 'overdue'
    recurrence?: 'once' | 'weekly' | 'monthly' | 'yearly'
    createdAt: string
  }) => void
  language: Language
  translations: Translations
}

export function AddBillModal({ open, onClose, onAdd, language, translations }: AddBillModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('once')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(language === 'pt-BR' ? 'Por favor, insira um valor válido' : 'Please enter a valid amount')
      return
    }

    if (!dueDate) {
      toast.error(language === 'pt-BR' ? 'Por favor, selecione uma data de vencimento' : 'Please select a due date')
      return
    }

    if (!description.trim()) {
      toast.error(language === 'pt-BR' ? 'Por favor, insira uma descrição' : 'Please enter a description')
      return
    }

    const dueDateObj = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDateObj.setHours(0, 0, 0, 0)

    const status = dueDateObj < today ? 'overdue' : 'pending'

    onAdd({
      id: generateId(),
      description: description.trim(),
      amount: amountNum,
      dueDate: dueDateObj.toISOString(),
      status,
      recurrence,
      createdAt: new Date().toISOString(),
    })

    toast.success(language === 'pt-BR' ? 'Lembrete de conta adicionado com sucesso' : 'Bill reminder added successfully')
    
    setDescription('')
    setAmount('')
    setDueDate('')
    setRecurrence('once')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{translations.bills.addBill}</DialogTitle>
          <DialogDescription>
            {language === 'pt-BR'
              ? 'Configure um lembrete para uma conta ou pagamento futuro'
              : 'Set up a reminder for an upcoming bill or payment'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bill-description">{translations.transactions.description}</Label>
            <Input
              id="bill-description"
              placeholder={language === 'pt-BR' ? 'ex: Conta de luz, Aluguel, Seguro' : 'e.g., Electric bill, Rent, Insurance'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-amount">{translations.transactions.amount}</Label>
            <Input
              id="bill-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-due-date">{translations.bills.dueDate}</Label>
            <Input
              id="bill-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-recurrence">{language === 'pt-BR' ? 'Recorrência' : 'Recurrence'}</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as any)}>
              <SelectTrigger id="bill-recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">{language === 'pt-BR' ? 'Única' : 'One-time'}</SelectItem>
                <SelectItem value="weekly">{language === 'pt-BR' ? 'Semanal' : 'Weekly'}</SelectItem>
                <SelectItem value="monthly">{language === 'pt-BR' ? 'Mensal' : 'Monthly'}</SelectItem>
                <SelectItem value="yearly">{language === 'pt-BR' ? 'Anual' : 'Yearly'}</SelectItem>
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
