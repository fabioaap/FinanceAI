import type { BankFileFormat, ParsedTransaction, CategoryType } from './types'
import type { CategoryMappingRule } from './bank-file-parser'

/**
 * Message types for communication between main thread and worker
 */
export type WorkerMessageType = 'parse' | 'cancel' | 'ping'
export type WorkerResponseType = 'progress' | 'complete' | 'error' | 'pong'

/**
 * Message sent from main thread to worker
 */
export interface WorkerRequest {
    type: WorkerMessageType
    id: string
    payload?: {
        fileName: string
        fileContent: string
        customRules?: CategoryMappingRule[]
    }
}

/**
 * Response sent from worker to main thread
 */
export interface WorkerResponse {
    type: WorkerResponseType
    id: string
    payload?: {
        // For 'progress' type
        progress?: number
        message?: string
        processedLines?: number
        totalLines?: number
        
        // For 'complete' type
        success?: boolean
        transactions?: ParsedTransaction[]
        errors?: string[]
        fileName?: string
        format?: BankFileFormat
        totalParsed?: number
        
        // For 'error' type
        error?: string
    }
}

/**
 * Parser configuration for worker
 */
export interface WorkerParserConfig {
    enableProgress?: boolean
    progressInterval?: number // Report progress every N lines (default: 1000)
    chunkSize?: number // Process in chunks of N lines (default: 5000)
}
