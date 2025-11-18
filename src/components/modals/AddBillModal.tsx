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
}

export function AddBillModal({ open, onClose, onAdd }: AddBillModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('once')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!dueDate) {
      toast.error('Please select a due date')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
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

    toast.success('Bill reminder added successfully')
    
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
          <DialogTitle>Add Bill Reminder</DialogTitle>
          <DialogDescription>
            Set up a reminder for an upcoming bill or payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bill-description">Description</Label>
            <Input
              id="bill-description"
              placeholder="e.g., Electric bill, Rent, Insurance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-amount">Amount</Label>
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
            <Label htmlFor="bill-due-date">Due Date</Label>
            <Input
              id="bill-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-recurrence">Recurrence</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as any)}>
              <SelectTrigger id="bill-recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Reminder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
