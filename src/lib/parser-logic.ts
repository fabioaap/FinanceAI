import type {
    BankFileFormat,
    ParsedTransaction,
    CategoryType
} from './types'

export interface CategoryMappingRule {
    id: string
    pattern: string
    category: CategoryType
    isRegex: boolean
    priority: number
}

export function detectFormat(fileName: string, content: string): BankFileFormat {
    const extension = fileName.split('.').pop()?.toLowerCase()

    if (extension === 'qif' || content.includes('!Type:')) {
        return 'qif'
    }

    if (extension === 'ofx' || content.includes('OFX') || content.includes('OFXHEADER')) {
        return 'ofx'
    }

    if (extension === 'csv' || content.includes(',') || content.includes(';')) {
        return 'csv'
    }

    return 'txt'
}

export function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null

    // Formato DD/MM/YYYY
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStr.split('/').map(Number)
        return new Date(year, month - 1, day)
    }

    // Formato YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day)
    }

    // Formato YYYYMMDD (OFX)
    if (dateStr.match(/^\d{8}/)) {
        const year = parseInt(dateStr.substring(0, 4))
        const month = parseInt(dateStr.substring(4, 6))
        const day = parseInt(dateStr.substring(6, 8))
        return new Date(year, month - 1, day)
    }

    return null
}

export function parseAmount(amountStr: string): number {
    if (!amountStr) return 0

    // Remove símbolos de moeda e espaços
    let clean = amountStr.replace(/[R$\s]/g, '')

    // Formato brasileiro (1.234,56) vs Americano (1,234.56)
    // Se tem vírgula no final (últimos 3 chars), assume decimal BR
    if (clean.match(/,\d{1,2}$/)) {
        clean = clean.replace(/\./g, '').replace(',', '.')
    } else {
        // Assume formato US, remove vírgulas de milhar
        clean = clean.replace(/,/g, '')
    }

    const value = parseFloat(clean)
    return isNaN(value) ? 0 : value
}

export function suggestCategory(description: string, customRules: CategoryMappingRule[]): CategoryType {
    const desc = description.toLowerCase()

    // 1. Verificar regras customizadas (prioridade alta)
    for (const rule of customRules) {
        if (rule.isRegex) {
            try {
                if (new RegExp(rule.pattern, 'i').test(description)) {
                    return rule.category
                }
            } catch {
                // Ignora regex inválido
            }
        } else {
            if (desc.includes(rule.pattern.toLowerCase())) {
                return rule.category
            }
        }
    }

    // 2. Regras padrão (fallback)
    if (desc.includes('ifood') || desc.includes('restaurante') || desc.includes('mercado')) return 'food'
    if (desc.includes('uber') || desc.includes('posto') || desc.includes('combustivel')) return 'transport'
    if (desc.includes('farmacia') || desc.includes('drogaria') || desc.includes('medico')) return 'health'
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('cinema')) return 'entertainment'
    if (desc.includes('salario') || desc.includes('pagamento') || desc.includes('pix recebido')) return 'work'
    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('amazon')) return 'shopping'

    return 'other'
}

export function parseCSV(content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const lines = content.split('\n').filter(line => line.trim())

    if (lines.length === 0) throw new Error('Arquivo CSV vazio')

    const separator = content.includes(';') ? ';' : ','
    const dataLines = lines.slice(1) // Pula header

    const parseCSVLine = (line: string, sep: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === sep && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        result.push(current.trim())
        return result
    }

    for (const line of dataLines) {
        try {
            const columns = parseCSVLine(line, separator)
            if (columns.length < 3) continue

            let transaction: ParsedTransaction | null = null

            if (columns.length >= 3 && !columns[3]) {
                const date = parseDate(columns[0])
                const description = columns[1]
                const amount = parseAmount(columns[2])

                if (date && amount) {
                    transaction = {
                        date: date.toISOString().split('T')[0],
                        description: description.trim(),
                        amount: Math.abs(amount),
                        type: amount < 0 ? 'expense' : 'income',
                        category: suggestCategory(description, customRules)
                    }
                }
            }
            else if (columns.length >= 4) {
                const date = parseDate(columns[0])
                const description = columns[1]
                const debit = parseAmount(columns[2])
                const credit = parseAmount(columns[3])

                if (date) {
                    const amount = debit !== 0 ? debit : credit
                    if (amount !== 0) {
                        transaction = {
                            date: date.toISOString().split('T')[0],
                            description: description.trim(),
                            amount: Math.abs(amount),
                            type: debit !== 0 ? 'expense' : 'income',
                            category: suggestCategory(description, customRules)
                        }
                    }
                }
            }

            if (transaction) transactions.push(transaction)
        } catch (e) {
            // Ignora linhas com erro
        }
    }
    return transactions
}

export function parseOFX(content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const dataStart = content.indexOf('<OFX>') || content.indexOf('<ofx>')
    const ofxData = dataStart >= 0 ? content.substring(dataStart) : content

    const transactionPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
    const matches = ofxData.matchAll(transactionPattern)

    for (const match of matches) {
        try {
            const txn = match[1]
            const dateMatch = txn.match(/<DTPOSTED>(\d{8})/i)
            const amountMatch = txn.match(/<TRNAMT>([-\d.]+)/i)
            const memoMatch = txn.match(/<MEMO>(.*?)<\//i)
            const nameMatch = txn.match(/<NAME>(.*?)<\//i)

            if (!dateMatch || !amountMatch) continue

            const date = parseDate(dateMatch[1])
            const amount = parseFloat(amountMatch[1])
            const description = (memoMatch?.[1] || nameMatch?.[1] || 'Transação').trim()

            if (!date) continue

            transactions.push({
                date: date.toISOString().split('T')[0],
                description,
                amount: Math.abs(amount),
                type: amount < 0 ? 'expense' : 'income',
                category: suggestCategory(description, customRules)
            })
        } catch {
            // Ignora erros
        }
    }
    return transactions
}

export function parseQIF(content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const lines = content.split('\n').map(l => l.trim()).filter(l => l)
    let currentTransaction: Partial<ParsedTransaction> = {}

    for (const line of lines) {
        if (line.startsWith('!Type:')) continue
        if (line === '^') {
            if (currentTransaction.date && currentTransaction.amount !== undefined) {
                transactions.push({
                    date: currentTransaction.date,
                    description: currentTransaction.description || 'Transação',
                    amount: Math.abs(currentTransaction.amount),
                    type: currentTransaction.type || 'expense',
                    category: currentTransaction.category || suggestCategory(currentTransaction.description || '', customRules)
                })
            }
            currentTransaction = {}
            continue
        }

        const type = line[0]
        const value = line.substring(1)

        switch (type) {
            case 'D':
                const date = parseDate(value)
                if (date) currentTransaction.date = date.toISOString().split('T')[0]
                break
            case 'T':
                const amount = parseAmount(value)
                currentTransaction.amount = amount
                currentTransaction.type = amount < 0 ? 'expense' : 'income'
                break
            case 'P':
            case 'M':
                currentTransaction.description = value
                break
        }
    }
    return transactions
}

export function parseTXT(content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    return []
}
