/**
 * Web Worker for parsing large bank files
 * Prevents UI blocking when processing files with 10k+ lines
 */

import type {
    BankFileFormat,
    ParsedTransaction,
    TransactionType,
    CategoryType
} from './types'
import type { CategoryMappingRule } from './bank-file-parser'
import type { WorkerRequest, WorkerResponse, WorkerParserConfig } from './bank-file-parser-worker.types'

// Worker configuration
const DEFAULT_CONFIG: WorkerParserConfig = {
    enableProgress: true,
    progressInterval: 1000,
    chunkSize: 5000
}

let currentConfig: WorkerParserConfig = { ...DEFAULT_CONFIG }
let isCancelled = false

/**
 * Main message handler
 */
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const { type, id, payload } = event.data

    isCancelled = false

    switch (type) {
        case 'ping':
            postResponse({ type: 'pong', id })
            break

        case 'cancel':
            isCancelled = true
            postResponse({
                type: 'error',
                id,
                payload: { error: 'Parsing cancelled by user' }
            })
            break

        case 'parse':
            if (!payload) {
                postResponse({
                    type: 'error',
                    id,
                    payload: { error: 'Missing payload for parse request' }
                })
                return
            }

            try {
                parseFile(id, payload.fileName, payload.fileContent, payload.customRules || [])
            } catch (error) {
                postResponse({
                    type: 'error',
                    id,
                    payload: {
                        error: error instanceof Error ? error.message : 'Unknown error during parsing'
                    }
                })
            }
            break

        default:
            postResponse({
                type: 'error',
                id,
                payload: { error: `Unknown message type: ${type}` }
            })
    }
}

/**
 * Send response back to main thread
 */
function postResponse(response: WorkerResponse): void {
    self.postMessage(response)
}

/**
 * Main parsing function
 */
function parseFile(
    id: string,
    fileName: string,
    fileContent: string,
    customRules: CategoryMappingRule[]
): void {
    try {
        const format = detectFormat(fileName, fileContent)
        
        postResponse({
            type: 'progress',
            id,
            payload: {
                progress: 0,
                message: `Detected format: ${format}`,
                processedLines: 0,
                totalLines: fileContent.split('\n').length
            }
        })

        const transactions = parseByFormat(id, format, fileContent, customRules)

        if (isCancelled) {
            return
        }

        postResponse({
            type: 'complete',
            id,
            payload: {
                success: true,
                transactions,
                errors: [],
                fileName,
                format,
                totalParsed: transactions.length
            }
        })
    } catch (error) {
        postResponse({
            type: 'error',
            id,
            payload: {
                error: error instanceof Error ? error.message : 'Unknown parsing error'
            }
        })
    }
}

/**
 * Detect file format
 */
function detectFormat(fileName: string, content: string): BankFileFormat {
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

/**
 * Parse by detected format
 */
function parseByFormat(
    id: string,
    format: BankFileFormat,
    content: string,
    customRules: CategoryMappingRule[]
): ParsedTransaction[] {
    switch (format) {
        case 'csv':
            return parseCSV(id, content, customRules)
        case 'ofx':
            return parseOFX(id, content, customRules)
        case 'qif':
            return parseQIF(id, content, customRules)
        case 'txt':
            return parseTXT(id, content, customRules)
        default:
            throw new Error(`Unsupported format: ${format}`)
    }
}

/**
 * Parse CSV format
 */
function parseCSV(id: string, content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const lines = content.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
        throw new Error('Empty CSV file')
    }

    const separator = content.includes(';') ? ';' : ','
    const dataLines = lines.slice(1) // Skip header
    const totalLines = dataLines.length

    for (let i = 0; i < dataLines.length; i++) {
        if (isCancelled) break

        try {
            const columns = parseCSVLine(dataLines[i], separator)
            if (columns.length < 3) continue

            const transaction = extractTransactionFromCSV(columns, customRules)
            if (transaction) {
                transactions.push(transaction)
            }
        } catch (error) {
            console.warn('Error parsing CSV line:', dataLines[i], error)
        }

        // Report progress
        if (currentConfig.enableProgress && (i + 1) % currentConfig.progressInterval! === 0) {
            postResponse({
                type: 'progress',
                id,
                payload: {
                    progress: Math.round(((i + 1) / totalLines) * 100),
                    message: `Parsing CSV: ${i + 1}/${totalLines} lines`,
                    processedLines: i + 1,
                    totalLines
                }
            })
        }
    }

    return transactions
}

/**
 * Parse CSV line considering quotes
 */
function parseCSVLine(line: string, separator: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === separator && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }

    result.push(current.trim())
    return result
}

/**
 * Extract transaction from CSV columns
 */
function extractTransactionFromCSV(
    columns: string[],
    customRules: CategoryMappingRule[]
): ParsedTransaction | null {
    try {
        // Format 1: Date, Description, Value
        if (columns.length >= 3) {
            const date = parseDate(columns[0])
            const description = columns[1]
            const amount = parseAmount(columns[2])

            if (!date || !amount) return null

            return {
                date: date.toISOString().split('T')[0],
                description: description.trim(),
                amount: Math.abs(amount),
                type: amount < 0 ? 'expense' : 'income',
                category: suggestCategory(description, customRules)
            }
        }

        // Format 2: Date, Description, Debit, Credit
        if (columns.length >= 4) {
            const date = parseDate(columns[0])
            const description = columns[1]
            const debit = parseAmount(columns[2])
            const credit = parseAmount(columns[3])

            if (!date) return null

            const amount = debit !== 0 ? debit : credit
            if (amount === 0) return null

            return {
                date: date.toISOString().split('T')[0],
                description: description.trim(),
                amount: Math.abs(amount),
                type: debit !== 0 ? 'expense' : 'income',
                category: suggestCategory(description, customRules)
            }
        }

        return null
    } catch {
        return null
    }
}

/**
 * Parse OFX format
 */
function parseOFX(id: string, content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []

    // Remove headers OFX
    const dataStart = content.indexOf('<OFX>') || content.indexOf('<ofx>')
    const ofxData = dataStart >= 0 ? content.substring(dataStart) : content

    // Regex to extract transactions
    const transactionPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
    const matches = Array.from(ofxData.matchAll(transactionPattern))
    const totalMatches = matches.length

    matches.forEach((match, index) => {
        if (isCancelled) return

        try {
            const txn = match[1]

            const dateMatch = txn.match(/<DTPOSTED>(\d{8})/i)
            const amountMatch = txn.match(/<TRNAMT>([-\d.]+)/i)
            const memoMatch = txn.match(/<MEMO>(.*?)<\//i)
            const nameMatch = txn.match(/<NAME>(.*?)<\//i)

            if (!dateMatch || !amountMatch) return

            const date = parseOFXDate(dateMatch[1])
            const amount = parseFloat(amountMatch[1])
            const description = (memoMatch?.[1] || nameMatch?.[1] || 'Transação').trim()

            if (!date) return

            transactions.push({
                date: date.toISOString().split('T')[0],
                description,
                amount: Math.abs(amount),
                type: amount < 0 ? 'expense' : 'income',
                category: suggestCategory(description, customRules)
            })
        } catch (error) {
            console.warn('Error parsing OFX transaction:', error)
        }

        // Report progress
        if (currentConfig.enableProgress && (index + 1) % currentConfig.progressInterval! === 0) {
            postResponse({
                type: 'progress',
                id,
                payload: {
                    progress: Math.round(((index + 1) / totalMatches) * 100),
                    message: `Parsing OFX: ${index + 1}/${totalMatches} transactions`,
                    processedLines: index + 1,
                    totalLines: totalMatches
                }
            })
        }
    })

    return transactions
}

/**
 * Parse QIF format
 */
function parseQIF(id: string, content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const lines = content.split('\n').map(l => l.trim()).filter(l => l)
    let currentTransaction: Partial<ParsedTransaction> = {}
    const totalLines = lines.length

    for (let i = 0; i < lines.length; i++) {
        if (isCancelled) break

        const line = lines[i]

        try {
            // New transaction header
            if (line.startsWith('!Type:')) {
                continue
            }

            // Transaction separator
            if (line === '^') {
                if (currentTransaction.date && currentTransaction.amount !== undefined) {
                    const txn: ParsedTransaction = {
                        date: currentTransaction.date,
                        description: currentTransaction.description || 'Transação',
                        amount: Math.abs(currentTransaction.amount),
                        type: currentTransaction.type || 'expense',
                        category: currentTransaction.category || suggestCategory(currentTransaction.description || '', customRules)
                    }
                    transactions.push(txn)
                }
                currentTransaction = {}
                continue
            }

            // Date (D)
            if (line.startsWith('D')) {
                const dateStr = line.substring(1).trim()
                const date = parseQIFDate(dateStr)
                if (date) {
                    currentTransaction.date = date.toISOString().split('T')[0]
                }
            }

            // Amount (T)
            if (line.startsWith('T')) {
                const amountStr = line.substring(1).trim()
                const amount = parseAmount(amountStr)
                currentTransaction.amount = Math.abs(amount)
                currentTransaction.type = amount < 0 ? 'expense' : 'income'
            }

            // Description/Payee (P)
            if (line.startsWith('P')) {
                currentTransaction.description = line.substring(1).trim()
            }

            // Memo (M)
            if (line.startsWith('M') && !currentTransaction.description) {
                currentTransaction.description = line.substring(1).trim()
            }

            // Category (L)
            if (line.startsWith('L')) {
                const categoryStr = line.substring(1).trim()
                const mappedCategory = mapQIFCategory(categoryStr)
                if (mappedCategory) {
                    currentTransaction.category = mappedCategory
                }
            }
        } catch (error) {
            console.warn('Error parsing QIF line:', line, error)
        }

        // Report progress
        if (currentConfig.enableProgress && (i + 1) % currentConfig.progressInterval! === 0) {
            postResponse({
                type: 'progress',
                id,
                payload: {
                    progress: Math.round(((i + 1) / totalLines) * 100),
                    message: `Parsing QIF: ${i + 1}/${totalLines} lines`,
                    processedLines: i + 1,
                    totalLines
                }
            })
        }
    }

    // Add last transaction if exists
    if (currentTransaction.date && currentTransaction.amount !== undefined) {
        const txn: ParsedTransaction = {
            date: currentTransaction.date,
            description: currentTransaction.description || 'Transação',
            amount: Math.abs(currentTransaction.amount),
            type: currentTransaction.type || 'expense',
            category: currentTransaction.category || suggestCategory(currentTransaction.description || '', customRules)
        }
        transactions.push(txn)
    }

    return transactions
}

/**
 * Parse TXT format
 */
function parseTXT(id: string, content: string, customRules: CategoryMappingRule[]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const lines = content.split('\n').filter(line => line.trim())
    const totalLines = lines.length

    for (let i = 0; i < lines.length; i++) {
        if (isCancelled) break

        try {
            // Pattern: dd/mm/yyyy description amount
            const pattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([-+]?\s*R?\$?\s*[\d.,]+)/i
            const match = lines[i].match(pattern)

            if (match) {
                const date = parseDate(match[1])
                const description = match[2].trim()
                const amount = parseAmount(match[3])

                if (date && amount !== 0) {
                    transactions.push({
                        date: date.toISOString().split('T')[0],
                        description,
                        amount: Math.abs(amount),
                        type: amount < 0 ? 'expense' : 'income',
                        category: suggestCategory(description, customRules)
                    })
                }
            }
        } catch (error) {
            console.warn('Error parsing TXT line:', lines[i], error)
        }

        // Report progress
        if (currentConfig.enableProgress && (i + 1) % currentConfig.progressInterval! === 0) {
            postResponse({
                type: 'progress',
                id,
                payload: {
                    progress: Math.round(((i + 1) / totalLines) * 100),
                    message: `Parsing TXT: ${i + 1}/${totalLines} lines`,
                    processedLines: i + 1,
                    totalLines
                }
            })
        }
    }

    return transactions
}

/**
 * Parse date in various formats
 */
function parseDate(dateStr: string): Date | null {
    try {
        const cleaned = dateStr.trim()

        // Format dd/mm/yyyy or dd-mm-yyyy
        const ddmmyyyy = cleaned.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
        if (ddmmyyyy) {
            const [, day, month, year] = ddmmyyyy
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }

        // Format yyyy-mm-dd
        const yyyymmdd = cleaned.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/)
        if (yyyymmdd) {
            const [, year, month, day] = yyyymmdd
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }

        return null
    } catch {
        return null
    }
}

/**
 * Parse OFX date (YYYYMMDD format)
 */
function parseOFXDate(dateStr: string): Date | null {
    try {
        const year = parseInt(dateStr.substring(0, 4))
        const month = parseInt(dateStr.substring(4, 6))
        const day = parseInt(dateStr.substring(6, 8))
        return new Date(year, month - 1, day)
    } catch {
        return null
    }
}

/**
 * Parse QIF date
 */
function parseQIFDate(dateStr: string): Date | null {
    try {
        const cleaned = dateStr.trim().replace(/'/g, '')

        // Format M/D/YYYY or M/D/YY
        const mdyMatch = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
        if (mdyMatch) {
            let [, month, day, year] = mdyMatch
            if (year.length === 2) {
                year = '20' + year
            }
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }

        return parseDate(cleaned)
    } catch {
        return null
    }
}

/**
 * Parse monetary amounts
 */
function parseAmount(amountStr: string): number {
    try {
        let cleaned = amountStr
            .replace(/R\$/gi, '')
            .replace(/\s/g, '')
            .trim()

        // Brazilian format (1.234,56) vs US format (1,234.56)
        const hasBrazilianFormat = cleaned.match(/\d+\.\d{3},\d{2}/)

        if (hasBrazilianFormat) {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.')
        } else {
            cleaned = cleaned.replace(/,/g, '')
        }

        return parseFloat(cleaned) || 0
    } catch {
        return 0
    }
}

/**
 * Suggest category based on description
 */
function suggestCategory(description: string, customRules: CategoryMappingRule[]): CategoryType {
    // Apply custom rules first (sorted by priority)
    const sortedRules = [...customRules].sort((a, b) => b.priority - a.priority)
    for (const rule of sortedRules) {
        if (matchesRule(description, rule)) {
            return rule.category
        }
    }

    // Fallback to default rules
    const desc = description.toLowerCase()

    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('restaurante') ||
        desc.includes('lanche') || desc.includes('ifood') || desc.includes('delivery')) {
        return 'food'
    }

    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('transporte') ||
        desc.includes('combustivel') || desc.includes('gasolina') || desc.includes('posto')) {
        return 'transport'
    }

    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('magazine') ||
        desc.includes('compra')) {
        return 'shopping'
    }

    if (desc.includes('farmacia') || desc.includes('consulta') || desc.includes('medic') ||
        desc.includes('hospital') || desc.includes('clinica')) {
        return 'health'
    }

    if (desc.includes('aluguel') || desc.includes('condominio') || desc.includes('energia') ||
        desc.includes('agua') || desc.includes('internet') || desc.includes('telefone')) {
        return 'home'
    }

    if (desc.includes('cinema') || desc.includes('netflix') || desc.includes('spotify') ||
        desc.includes('show') || desc.includes('evento')) {
        return 'entertainment'
    }

    if (desc.includes('escola') || desc.includes('curso') || desc.includes('faculdade') ||
        desc.includes('livro')) {
        return 'education'
    }

    if (desc.includes('salario') || desc.includes('pagamento') || desc.includes('freelance')) {
        return 'work'
    }

    return 'other'
}

/**
 * Check if description matches a rule
 */
function matchesRule(description: string, rule: CategoryMappingRule): boolean {
    try {
        if (rule.isRegex) {
            const regex = new RegExp(rule.pattern, 'i')
            return regex.test(description)
        } else {
            return description.toLowerCase().includes(rule.pattern.toLowerCase())
        }
    } catch {
        return false
    }
}

/**
 * Map QIF category to CategoryType
 */
function mapQIFCategory(qifCategory: string): CategoryType | undefined {
    const lower = qifCategory.toLowerCase()

    if (lower.includes('food') || lower.includes('groceries') || lower.includes('restaurant')) {
        return 'food'
    }
    if (lower.includes('transport') || lower.includes('gas') || lower.includes('auto')) {
        return 'transport'
    }
    if (lower.includes('shopping') || lower.includes('clothing')) {
        return 'shopping'
    }
    if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor')) {
        return 'health'
    }
    if (lower.includes('home') || lower.includes('utilities') || lower.includes('rent')) {
        return 'home'
    }
    if (lower.includes('entertainment') || lower.includes('recreation')) {
        return 'entertainment'
    }
    if (lower.includes('education') || lower.includes('school')) {
        return 'education'
    }
    if (lower.includes('salary') || lower.includes('income') || lower.includes('work')) {
        return 'work'
    }

    return undefined
}
