import type {
    BankFileFormat,
    BankFileParseResult,
    ParsedTransaction,
    TransactionType,
    CategoryType
} from './types'

/**
 * Parser para arquivos bancários em diferentes formatos
 */
export class BankFileParser {
    private fileName: string
    private fileContent: string
    private format: BankFileFormat | null = null

    constructor(file: File) {
        this.fileName = file.name
    }

    /**
     * Carrega e faz o parse do arquivo
     */
    async parse(file: File): Promise<BankFileParseResult> {
        try {
            this.fileContent = await this.readFile(file)
            this.format = this.detectFormat(file.name, this.fileContent)

            const transactions = this.parseByFormat(this.format)

            return {
                success: true,
                transactions,
                errors: [],
                fileName: this.fileName,
                format: this.format,
                totalParsed: transactions.length
            }
        } catch (error) {
            return {
                success: false,
                transactions: [],
                errors: [error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo'],
                fileName: this.fileName,
                format: this.format || 'csv',
                totalParsed: 0
            }
        }
    }

    /**
     * Lê o conteúdo do arquivo
     */
    private readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
            reader.readAsText(file, 'UTF-8')
        })
    }

    /**
     * Detecta o formato do arquivo baseado na extensão e conteúdo
     */
    private detectFormat(fileName: string, content: string): BankFileFormat {
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
     * Parse baseado no formato detectado
     */
    private parseByFormat(format: BankFileFormat): ParsedTransaction[] {
        switch (format) {
            case 'csv':
                return this.parseCSV(this.fileContent)
            case 'ofx':
                return this.parseOFX(this.fileContent)
            case 'qif':
                return this.parseQIF(this.fileContent)
            case 'txt':
                return this.parseTXT(this.fileContent)
            default:
                throw new Error(`Formato não suportado: ${format}`)
        }
    }

    /**
     * Parser para arquivos CSV
     * Suporta diferentes separadores (vírgula, ponto-e-vírgula)
     */
    private parseCSV(content: string): ParsedTransaction[] {
        const transactions: ParsedTransaction[] = []
        const lines = content.split('\n').filter(line => line.trim())

        if (lines.length === 0) {
            throw new Error('Arquivo CSV vazio')
        }

        // Detecta o separador
        const separator = content.includes(';') ? ';' : ','

        // Pula a primeira linha (cabeçalho)
        const dataLines = lines.slice(1)

        for (const line of dataLines) {
            try {
                const columns = this.parseCSVLine(line, separator)

                if (columns.length < 3) continue // Ignora linhas incompletas

                const transaction = this.extractTransactionFromCSV(columns)
                if (transaction) {
                    transactions.push(transaction)
                }
            } catch (error) {
                console.warn('Erro ao processar linha CSV:', line, error)
            }
        }

        return transactions
    }

    /**
     * Parse de linha CSV considerando aspas
     */
    private parseCSVLine(line: string, separator: string): string[] {
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
     * Extrai transação de colunas CSV
     * Suporta formatos comuns de bancos brasileiros:
     * - Data, Descrição, Valor
     * - Data, Descrição, Débito, Crédito
     * - Data, Histórico, Valor, Saldo
     */
    private extractTransactionFromCSV(columns: string[]): ParsedTransaction | null {
        try {
            // Formato 1: Data, Descrição, Valor
            if (columns.length >= 3) {
                const date = this.parseDate(columns[0])
                const description = columns[1]
                const amount = this.parseAmount(columns[2])

                if (!date || !amount) return null

                return {
                    date: date.toISOString().split('T')[0],
                    description: description.trim(),
                    amount: Math.abs(amount),
                    type: amount < 0 ? 'expense' : 'income',
                    category: this.suggestCategory(description)
                }
            }

            // Formato 2: Data, Descrição, Débito, Crédito
            if (columns.length >= 4) {
                const date = this.parseDate(columns[0])
                const description = columns[1]
                const debit = this.parseAmount(columns[2])
                const credit = this.parseAmount(columns[3])

                if (!date) return null

                const amount = debit !== 0 ? debit : credit
                if (amount === 0) return null

                return {
                    date: date.toISOString().split('T')[0],
                    description: description.trim(),
                    amount: Math.abs(amount),
                    type: debit !== 0 ? 'expense' : 'income',
                    category: this.suggestCategory(description)
                }
            }

            return null
        } catch {
            return null
        }
    }

    /**
     * Parser para arquivos OFX (Open Financial Exchange)
     */
    private parseOFX(content: string): ParsedTransaction[] {
        const transactions: ParsedTransaction[] = []

        // Remove headers OFX
        const dataStart = content.indexOf('<OFX>') || content.indexOf('<ofx>')
        const ofxData = dataStart >= 0 ? content.substring(dataStart) : content

        // Regex para extrair transações
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

                const date = this.parseOFXDate(dateMatch[1])
                const amount = parseFloat(amountMatch[1])
                const description = (memoMatch?.[1] || nameMatch?.[1] || 'Transação').trim()

                if (!date) continue

                transactions.push({
                    date: date.toISOString().split('T')[0],
                    description,
                    amount: Math.abs(amount),
                    type: amount < 0 ? 'expense' : 'income',
                    category: this.suggestCategory(description)
                })
            } catch (error) {
                console.warn('Erro ao processar transação OFX:', error)
            }
        }

        return transactions
    }

    /**
     * Parser para arquivos QIF (Quicken Interchange Format)
     * Formato usado por Quicken, Microsoft Money e outros
     */
    private parseQIF(content: string): ParsedTransaction[] {
        const transactions: ParsedTransaction[] = []
        const lines = content.split('\n').map(l => l.trim()).filter(l => l)

        let currentTransaction: Partial<ParsedTransaction> = {}

        for (const line of lines) {
            try {
                // Nova transação
                if (line.startsWith('!Type:')) {
                    continue // Header line
                }

                // Separador de transação
                if (line === '^') {
                    if (currentTransaction.date && currentTransaction.amount !== undefined) {
                        const txn: ParsedTransaction = {
                            date: currentTransaction.date,
                            description: currentTransaction.description || 'Transação',
                            amount: Math.abs(currentTransaction.amount),
                            type: currentTransaction.type || 'expense',
                            category: currentTransaction.category || this.suggestCategory(currentTransaction.description || '')
                        }
                        transactions.push(txn)
                    }
                    currentTransaction = {}
                    continue
                }

                // Data (D)
                if (line.startsWith('D')) {
                    const dateStr = line.substring(1).trim()
                    const date = this.parseQIFDate(dateStr)
                    if (date) {
                        currentTransaction.date = date.toISOString().split('T')[0]
                    }
                }

                // Valor (T)
                if (line.startsWith('T')) {
                    const amountStr = line.substring(1).trim()
                    const amount = this.parseAmount(amountStr)
                    currentTransaction.amount = Math.abs(amount)
                    currentTransaction.type = amount < 0 ? 'expense' : 'income'
                }

                // Descrição/Payee (P)
                if (line.startsWith('P')) {
                    currentTransaction.description = line.substring(1).trim()
                }

                // Memo (M)
                if (line.startsWith('M') && !currentTransaction.description) {
                    currentTransaction.description = line.substring(1).trim()
                }

                // Categoria (L)
                if (line.startsWith('L')) {
                    const categoryStr = line.substring(1).trim()
                    // QIF categories podem ser "Category:Subcategory"
                    const mappedCategory = this.mapQIFCategory(categoryStr)
                    if (mappedCategory) {
                        currentTransaction.category = mappedCategory
                    }
                }
            } catch (error) {
                console.warn('Erro ao processar linha QIF:', line, error)
            }
        }

        // Adiciona última transação se existir
        if (currentTransaction.date && currentTransaction.amount !== undefined) {
            const txn: ParsedTransaction = {
                date: currentTransaction.date,
                description: currentTransaction.description || 'Transação',
                amount: Math.abs(currentTransaction.amount),
                type: currentTransaction.type || 'expense',
                category: currentTransaction.category || this.suggestCategory(currentTransaction.description || '')
            }
            transactions.push(txn)
        }

        return transactions
    }

    /**
     * Parse de data QIF (formatos: M/D/YYYY, M/D'YY, DD/MM/YYYY)
     */
    private parseQIFDate(dateStr: string): Date | null {
        try {
            // Remove espaços e apóstrofos
            const cleaned = dateStr.trim().replace(/'/g, '')

            // Formato M/D/YYYY ou M/D/YY
            const mdyMatch = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
            if (mdyMatch) {
                let [, month, day, year] = mdyMatch
                // Se ano com 2 dígitos, assume 20xx
                if (year.length === 2) {
                    year = '20' + year
                }
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }

            // Fallback para parser geral
            return this.parseDate(cleaned)
        } catch {
            return null
        }
    }

    /**
     * Mapeia categoria QIF para CategoryType
     */
    private mapQIFCategory(qifCategory: string): CategoryType | undefined {
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

    /**
     * Parser para arquivos TXT (formato livre)
     * Tenta identificar padrões comuns
     */
    private parseTXT(content: string): ParsedTransaction[] {
        const transactions: ParsedTransaction[] = []
        const lines = content.split('\n').filter(line => line.trim())

        for (const line of lines) {
            try {
                // Padrão: dd/mm/yyyy descrição valor
                const pattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([-+]?\s*R?\$?\s*[\d.,]+)/i
                const match = line.match(pattern)

                if (match) {
                    const date = this.parseDate(match[1])
                    const description = match[2].trim()
                    const amount = this.parseAmount(match[3])

                    if (date && amount !== 0) {
                        transactions.push({
                            date: date.toISOString().split('T')[0],
                            description,
                            amount: Math.abs(amount),
                            type: amount < 0 ? 'expense' : 'income',
                            category: this.suggestCategory(description)
                        })
                    }
                }
            } catch (error) {
                console.warn('Erro ao processar linha TXT:', line, error)
            }
        }

        return transactions
    }

    /**
     * Parse de data em diversos formatos
     */
    private parseDate(dateStr: string): Date | null {
        try {
            // Remove espaços e caracteres especiais
            const cleaned = dateStr.trim()

            // Formato dd/mm/yyyy ou dd-mm-yyyy
            const ddmmyyyy = cleaned.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
            if (ddmmyyyy) {
                const [, day, month, year] = ddmmyyyy
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }

            // Formato yyyy-mm-dd
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
     * Parse de data OFX (formato YYYYMMDD)
     */
    private parseOFXDate(dateStr: string): Date | null {
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
     * Parse de valores monetários
     */
    private parseAmount(amountStr: string): number {
        try {
            // Remove símbolos de moeda e espaços
            let cleaned = amountStr
                .replace(/R\$/gi, '')
                .replace(/\s/g, '')
                .trim()

            // Trata formatos brasileiros (1.234,56) e americanos (1,234.56)
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
     * Sugere categoria baseada na descrição
     */
    private suggestCategory(description: string): CategoryType {
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
}

/**
 * Função auxiliar para fazer parse de arquivo bancário
 */
export async function parseBankFile(file: File): Promise<BankFileParseResult> {
    const parser = new BankFileParser(file)
    return parser.parse(file)
}
