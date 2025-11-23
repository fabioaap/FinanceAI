import type {
    BankFileParseResult,
    ParsedTransaction
} from '../types'
import {
    CategoryMappingRule,
    detectFormat,
    parseCSV,
    parseOFX,
    parseQIF,
    parseTXT
} from '../parser-logic'

interface WorkerMessage {
    type: 'START_PARSE'
    payload: {
        fileContent: string
        fileName: string
        customRules: CategoryMappingRule[]
    }
}

interface WorkerResponse {
    type: 'PARSE_COMPLETE' | 'PARSE_ERROR' | 'PARSE_PROGRESS'
    payload?: BankFileParseResult | { progress: number; message: string }
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, payload } = e.data

    if (type === 'START_PARSE') {
        const { fileContent, fileName, customRules } = payload

        try {
            const format = detectFormat(fileName, fileContent)
            let transactions: ParsedTransaction[] = []

            switch (format) {
                case 'csv':
                    transactions = parseCSV(fileContent, customRules)
                    break
                case 'ofx':
                    transactions = parseOFX(fileContent, customRules)
                    break
                case 'qif':
                    transactions = parseQIF(fileContent, customRules)
                    break
                case 'txt':
                    transactions = parseTXT(fileContent, customRules)
                    break
                default:
                    throw new Error(`Formato não suportado: ${format}`)
            }

            const result: BankFileParseResult = {
                success: true,
                transactions,
                errors: [],
                fileName,
                format,
                totalParsed: transactions.length
            }

            self.postMessage({ type: 'PARSE_COMPLETE', payload: result })

        } catch (error) {
            self.postMessage({
                type: 'PARSE_ERROR',
                payload: {
                    success: false,
                    transactions: [],
                    errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
                    fileName,
                    format: 'csv', // fallback
                    totalParsed: 0
                } as BankFileParseResult
            })
        }
    }
}
