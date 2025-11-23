import type {
    BankFileFormat,
    BankFileParseResult,
    ParsedTransaction,
    CategoryType
} from './types'
import {
    CategoryMappingRule,
    detectFormat,
    parseCSV,
    parseOFX,
    parseQIF,
    parseTXT
} from './parser-logic'

export type { CategoryMappingRule }

/**
 * Parser para arquivos bancários em diferentes formatos
 * Usa Web Worker para processamento em background quando disponível
 */
export class BankFileParser {
    private fileName: string
    private fileContent: string = ''
    private format: BankFileFormat | null = null
    private customRules: CategoryMappingRule[] = []

    constructor(file: File, customRules: CategoryMappingRule[] = []) {
        this.fileName = file.name
        this.customRules = customRules.sort((a, b) => b.priority - a.priority)
    }

    /**
     * Carrega e faz o parse do arquivo
     */
    async parse(file: File): Promise<BankFileParseResult> {
        try {
            this.fileContent = await this.readFile(file)
            
            // Se suportar Worker, usa processamento em background
            if (typeof Worker !== 'undefined') {
                return await this.parseWithWorker()
            }

            // Fallback para processamento síncrono (testes/ambientes sem Worker)
            return this.parseSync()

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

    private parseWithWorker(): Promise<BankFileParseResult> {
        return new Promise((resolve, reject) => {
            const worker = new Worker(new URL('./workers/file-parser.worker.ts', import.meta.url), {
                type: 'module'
            })

            worker.onmessage = (e) => {
                const { type, payload } = e.data
                if (type === 'PARSE_COMPLETE') {
                    resolve(payload as BankFileParseResult)
                    worker.terminate()
                } else if (type === 'PARSE_ERROR') {
                    resolve(payload as BankFileParseResult) // Resolve com erro formatado
                    worker.terminate()
                }
            }

            worker.onerror = (e) => {
                reject(new Error('Erro no Worker: ' + e.message))
                worker.terminate()
            }

            worker.postMessage({
                type: 'START_PARSE',
                payload: {
                    fileContent: this.fileContent,
                    fileName: this.fileName,
                    customRules: this.customRules
                }
            })
        })
    }

    private parseSync(): BankFileParseResult {
        this.format = detectFormat(this.fileName, this.fileContent)
        let transactions: ParsedTransaction[] = []

        switch (this.format) {
            case 'csv':
                transactions = parseCSV(this.fileContent, this.customRules)
                break
            case 'ofx':
                transactions = parseOFX(this.fileContent, this.customRules)
                break
            case 'qif':
                transactions = parseQIF(this.fileContent, this.customRules)
                break
            case 'txt':
                transactions = parseTXT(this.fileContent, this.customRules)
                break
            default:
                throw new Error(`Formato não suportado: ${this.format}`)
        }

        return {
            success: true,
            transactions,
            errors: [],
            fileName: this.fileName,
            format: this.format,
            totalParsed: transactions.length
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
}
