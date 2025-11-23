import { useState, useEffect } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Info } from 'lucide-react'
import { CategoryType } from '@/lib/types'

export interface CategoryRule {
    id: string
    keyword: string
    category: CategoryType
    caseSensitive: boolean
}

interface CategoryMappingModalProps {
    open: boolean
    onClose: () => void
}

const categoryOptions: { value: CategoryType; label: string; icon: string }[] = [
    { value: 'shopping', label: 'Compras', icon: '🛍️' },
    { value: 'food', label: 'Alimentação', icon: '🍔' },
    { value: 'transport', label: 'Transporte', icon: '🚗' },
    { value: 'home', label: 'Casa', icon: '🏠' },
    { value: 'health', label: 'Saúde', icon: '💊' },
    { value: 'education', label: 'Educação', icon: '📚' },
    { value: 'entertainment', label: 'Entretenimento', icon: '🎮' },
    { value: 'work', label: 'Trabalho', icon: '💼' },
    { value: 'other', label: 'Outros', icon: '📌' },
]

export function CategoryMappingModal({ open, onClose }: CategoryMappingModalProps) {
    const [rules, setRules] = useState<CategoryRule[]>(() => {
        try {
            const stored = localStorage.getItem('category-rules')
            return stored ? JSON.parse(stored) : []
        } catch (error) {
            console.error('Failed to load category rules:', error)
            return []
        }
    })

    // Persiste regras no localStorage sempre que mudar
    useEffect(() => {
        try {
            localStorage.setItem('category-rules', JSON.stringify(rules))
        } catch (error) {
            console.error('Failed to save category rules:', error)
        }
    }, [rules])

    const [newKeyword, setNewKeyword] = useState('')
    const [newCategory, setNewCategory] = useState<CategoryType>('other')
    const [caseSensitive, setCaseSensitive] = useState(false)

    const handleAddRule = () => {
        if (!newKeyword.trim()) return

        const newRule: CategoryRule = {
            id: crypto.randomUUID(),
            keyword: newKeyword.trim(),
            category: newCategory,
            caseSensitive,
        }

        setRules([...(rules || []), newRule])
        setNewKeyword('')
        setNewCategory('other')
        setCaseSensitive(false)
    }

    const handleDeleteRule = (ruleId: string) => {
        setRules((rules || []).filter((r) => r.id !== ruleId))
    }

    const getCategoryLabel = (category: CategoryType) => {
        const option = categoryOptions.find((o) => o.value === category)
        return option ? `${option.icon} ${option.label}` : category
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Mapeamento de Categorias</DialogTitle>
                    <DialogDescription>
                        Configure palavras-chave para categorizar transações automaticamente durante a importação
                    </DialogDescription>
                </DialogHeader>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        As regras são aplicadas na ordem. A primeira palavra-chave encontrada na descrição da transação define a categoria.
                    </AlertDescription>
                </Alert>

                {/* Add new rule section */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-medium">Nova Regra</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="keyword">Palavra-chave</Label>
                            <Input
                                id="keyword"
                                placeholder="Ex: Uber, Netflix, Supermercado..."
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select value={newCategory} onValueChange={(v) => setNewCategory(v as CategoryType)}>
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex items-end">
                            <Button onClick={handleAddRule} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="case-sensitive"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="rounded"
                        />
                        <Label htmlFor="case-sensitive" className="text-sm font-normal cursor-pointer">
                            Diferenciar maiúsculas e minúsculas
                        </Label>
                    </div>
                </div>

                {/* Rules list */}
                <div className="space-y-2">
                    <h3 className="font-medium">Regras Ativas ({(rules || []).length})</h3>

                    {!rules || rules.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Nenhuma regra configurada</p>
                            <p className="text-sm">Adicione palavras-chave para categorizar transações automaticamente</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {rules.map((rule, index) => (
                                <div
                                    key={rule.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {rule.keyword}
                                                {rule.caseSensitive && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                        Aa
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                → {getCategoryLabel(rule.category)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
