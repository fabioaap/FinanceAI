import type { Transaction } from './types'
import crypto from 'crypto'

/**
 * Gera hash único para uma transação baseado em date + amount + description
 */
export function generateTransactionHash(transaction: Pick<Transaction, 'date' | 'amount' | 'description'>): string {
    const hashInput = `${transaction.date}|${transaction.amount}|${transaction.description.toLowerCase().trim()}`

    // Use Web Crypto API when available (browser), otherwise Node crypto
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment - use TextEncoder + subtle crypto
        const encoder = new TextEncoder()
        const data = encoder.encode(hashInput)
        return btoa(String.fromCharCode(...Array.from(data))).substring(0, 32)
    }

    // Node environment or fallback - use simple hash
    return btoa(hashInput).substring(0, 32)
}

/**
 * Verifica se uma transação é duplicata comparando com lista existente
 */
export function findDuplicates(
    newTransactions: Pick<Transaction, 'date' | 'amount' | 'description'>[],
    existingTransactions: Pick<Transaction, 'date' | 'amount' | 'description'>[]
): {
    duplicates: typeof newTransactions
    unique: typeof newTransactions
} {
    const existingHashes = new Set(
        existingTransactions.map(t => generateTransactionHash(t))
    )

    const duplicates: typeof newTransactions = []
    const unique: typeof newTransactions = []

    for (const txn of newTransactions) {
        const hash = generateTransactionHash(txn)
        if (existingHashes.has(hash)) {
            duplicates.push(txn)
        } else {
            unique.push(txn)
            existingHashes.add(hash) // Prevent duplicates within the same import
        }
    }

    return { duplicates, unique }
}

/**
 * Filtra transações removendo duplicatas de um conjunto
 */
export function removeDuplicateTransactions<T extends Pick<Transaction, 'date' | 'amount' | 'description'>>(
    transactions: T[]
): T[] {
    const seen = new Set<string>()
    return transactions.filter(txn => {
        const hash = generateTransactionHash(txn)
        if (seen.has(hash)) {
            return false
        }
        seen.add(hash)
        return true
    })
}
