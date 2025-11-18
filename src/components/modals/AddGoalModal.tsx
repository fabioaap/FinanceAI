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
}

export function AddGoalModal({ open, onClose, onAdd }: AddGoalModalProps) {
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [type, setType] = useState<'savings' | 'debt' | 'reserve'>('savings')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const targetNum = parseFloat(targetAmount)
    if (isNaN(targetNum) || targetNum <= 0) {
      toast.error('Please enter a valid target amount')
      return
    }

    if (!deadline) {
      toast.error('Please select a deadline')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
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

    toast.success('Savings goal created successfully')
    
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
          <DialogTitle>Create Savings Goal</DialogTitle>
          <DialogDescription>
            Set a financial goal and track your progress toward it
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal-description">Goal Description</Label>
            <Input
              id="goal-description"
              placeholder="e.g., Emergency fund, New car, Vacation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-type">Goal Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger id="goal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="debt">Debt Payoff</SelectItem>
                <SelectItem value="reserve">Emergency Reserve</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target">Target Amount</Label>
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
            <Label htmlFor="goal-deadline">Deadline</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
