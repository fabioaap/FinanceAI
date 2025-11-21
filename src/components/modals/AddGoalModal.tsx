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

interface AddGoalModalProps {
  open: boolean
  onClose: () => void
  onAdd: (goal: {
    id: string
    description: string
    targetAmount: number
    currentAmount: number
    deadline: string
    type: 'savings' | 'debt' | 'reserve'
    createdAt: string
  }) => void
  language: Language
  translations: Translations
}

export function AddGoalModal({ open, onClose, onAdd, language, translations }: AddGoalModalProps) {
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [type, setType] = useState<'savings' | 'debt' | 'reserve'>('savings')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const targetNum = parseFloat(targetAmount)
    if (isNaN(targetNum) || targetNum <= 0) {
      toast.error(language === 'pt-BR' ? 'Por favor, insira um valor meta válido' : 'Please enter a valid target amount')
      return
    }

    if (!deadline) {
      toast.error(language === 'pt-BR' ? 'Por favor, selecione um prazo' : 'Please select a deadline')
      return
    }

    if (!description.trim()) {
      toast.error(language === 'pt-BR' ? 'Por favor, insira uma descrição' : 'Please enter a description')
      return
    }

    onAdd({
      id: generateId(),
      description: description.trim(),
      targetAmount: targetNum,
      currentAmount: 0,
      deadline: new Date(deadline).toISOString(),
      type,
      createdAt: new Date().toISOString(),
    })

    toast.success(language === 'pt-BR' ? 'Meta de economia criada com sucesso' : 'Savings goal created successfully')
    
    setDescription('')
    setTargetAmount('')
    setDeadline('')
    setType('savings')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{translations.goals.addGoal}</DialogTitle>
          <DialogDescription>
            {language === 'pt-BR'
              ? 'Defina uma meta financeira e acompanhe seu progresso'
              : 'Set a financial goal and track your progress toward it'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal-description">{language === 'pt-BR' ? 'Descrição da Meta' : 'Goal Description'}</Label>
            <Input
              id="goal-description"
              placeholder={language === 'pt-BR' ? 'ex: Fundo de emergência, Carro novo, Viagem' : 'e.g., Emergency fund, New car, Vacation'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-type">{language === 'pt-BR' ? 'Tipo de Meta' : 'Goal Type'}</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger id="goal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">{translations.goals.savings}</SelectItem>
                <SelectItem value="debt">{translations.goals.debt}</SelectItem>
                <SelectItem value="reserve">{translations.goals.reserve}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target">{language === 'pt-BR' ? 'Valor Meta' : 'Target Amount'}</Label>
            <Input
              id="goal-target"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-deadline">{translations.goals.deadline}</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
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
