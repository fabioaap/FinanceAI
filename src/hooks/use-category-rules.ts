import { useState, useEffect } from 'react'
import type { CategoryMappingRule } from '../lib/bank-file-parser'

const STORAGE_KEY = 'financeai:category-rules'

/**
 * Hook para gerenciar regras customizadas de mapeamento de categorias
 */
export function useCategoryRules() {
    const [rules, setRules] = useState<CategoryMappingRule[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Carrega regras do localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                setRules(parsed)
            }
        } catch (error) {
            console.error('Erro ao carregar regras de categoria:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Salva regras no localStorage
    const saveRules = (newRules: CategoryMappingRule[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules))
            setRules(newRules)
        } catch (error) {
            console.error('Erro ao salvar regras de categoria:', error)
            throw error
        }
    }

    // Adiciona nova regra
    const addRule = (rule: Omit<CategoryMappingRule, 'id'>) => {
        const newRule: CategoryMappingRule = {
            ...rule,
            id: crypto.randomUUID()
        }
        const updated = [...rules, newRule]
        saveRules(updated)
        return newRule
    }

    // Atualiza regra existente
    const updateRule = (id: string, updates: Partial<CategoryMappingRule>) => {
        const updated = rules.map(rule =>
            rule.id === id ? { ...rule, ...updates } : rule
        )
        saveRules(updated)
    }

    // Remove regra
    const deleteRule = (id: string) => {
        const updated = rules.filter(rule => rule.id !== id)
        saveRules(updated)
    }

    // Reordena regras (importante para prioridade)
    const reorderRules = (newOrder: CategoryMappingRule[]) => {
        // Atualiza prioridade com base na nova ordem
        const updated = newOrder.map((rule, index) => ({
            ...rule,
            priority: newOrder.length - index
        }))
        saveRules(updated)
    }

    // Importa regras (substitui todas)
    const importRules = (importedRules: CategoryMappingRule[]) => {
        saveRules(importedRules)
    }

    // Exporta regras (para backup)
    const exportRules = () => {
        return JSON.stringify(rules, null, 2)
    }

    // Reseta para regras padrão
    const resetToDefaults = () => {
        saveRules([])
    }

    return {
        rules,
        isLoading,
        addRule,
        updateRule,
        deleteRule,
        reorderRules,
        importRules,
        exportRules,
        resetToDefaults
    }
}
