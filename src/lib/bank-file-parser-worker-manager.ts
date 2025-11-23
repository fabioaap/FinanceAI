/**
 * Worker Manager for Bank File Parser
 * Provides high-level interface for using the parser worker
 */

import type { BankFileParseResult } from './types'
import type { CategoryMappingRule } from './bank-file-parser'
import type {
    WorkerRequest,
    WorkerResponse,
    WorkerParserConfig
} from './bank-file-parser-worker.types'

export interface ParseProgressCallback {
    (progress: number, message: string, processedLines: number, totalLines: number): void
}

export interface WorkerManagerOptions {
    onProgress?: ParseProgressCallback
    config?: WorkerParserConfig
}

/**
 * Manager class for the parser worker
 */
export class BankFileParserWorkerManager {
    private worker: Worker | null = null
    private currentRequestId: string | null = null
    private onProgress?: ParseProgressCallback
    private config: WorkerParserConfig

    constructor(options: WorkerManagerOptions = {}) {
        this.onProgress = options.onProgress
        this.config = options.config || {
            enableProgress: true,
            progressInterval: 1000,
            chunkSize: 5000
        }
    }

    /**
     * Check if Web Workers are supported
     */
    static isSupported(): boolean {
        return typeof Worker !== 'undefined'
    }

    /**
     * Initialize the worker
     */
    private initWorker(): Worker {
        if (this.worker) {
            return this.worker
        }

        // Create worker from the worker file
        // Vite will handle bundling this as a separate chunk
        this.worker = new Worker(
            new URL('./bank-file-parser.worker.ts', import.meta.url),
            { type: 'module' }
        )

        return this.worker
    }

    /**
     * Parse a bank file using the worker
     */
    async parse(
        file: File,
        customRules: CategoryMappingRule[] = []
    ): Promise<BankFileParseResult> {
        // Fallback to sync parsing if workers not supported
        if (!BankFileParserWorkerManager.isSupported()) {
            return this.fallbackToSync(file, customRules)
        }

        try {
            const worker = this.initWorker()
            const requestId = this.generateRequestId()
            this.currentRequestId = requestId

            // Read file content
            const fileContent = await this.readFile(file)

            // Create promise that resolves when worker completes
            const result = await new Promise<BankFileParseResult>((resolve, reject) => {
                const messageHandler = (event: MessageEvent<WorkerResponse>) => {
                    const response = event.data

                    // Only handle messages for current request
                    if (response.id !== requestId) {
                        return
                    }

                    switch (response.type) {
                        case 'progress':
                            if (this.onProgress && response.payload) {
                                this.onProgress(
                                    response.payload.progress || 0,
                                    response.payload.message || '',
                                    response.payload.processedLines || 0,
                                    response.payload.totalLines || 0
                                )
                            }
                            break

                        case 'complete':
                            worker.removeEventListener('message', messageHandler)
                            worker.removeEventListener('error', errorHandler)
                            
                            if (response.payload) {
                                resolve({
                                    success: response.payload.success || false,
                                    transactions: response.payload.transactions || [],
                                    errors: response.payload.errors || [],
                                    fileName: response.payload.fileName || file.name,
                                    format: response.payload.format || 'csv',
                                    totalParsed: response.payload.totalParsed || 0
                                })
                            } else {
                                reject(new Error('Invalid worker response'))
                            }
                            break

                        case 'error':
                            worker.removeEventListener('message', messageHandler)
                            worker.removeEventListener('error', errorHandler)
                            reject(new Error(response.payload?.error || 'Worker error'))
                            break
                    }
                }

                const errorHandler = (error: ErrorEvent) => {
                    worker.removeEventListener('message', messageHandler)
                    worker.removeEventListener('error', errorHandler)
                    reject(new Error(`Worker error: ${error.message}`))
                }

                worker.addEventListener('message', messageHandler)
                worker.addEventListener('error', errorHandler)

                // Send parse request
                const request: WorkerRequest = {
                    type: 'parse',
                    id: requestId,
                    payload: {
                        fileName: file.name,
                        fileContent,
                        customRules
                    }
                }

                worker.postMessage(request)
            })

            return result
        } catch (error) {
            // Fallback to sync parsing on error
            console.warn('Worker parsing failed, falling back to sync:', error)
            return this.fallbackToSync(file, customRules)
        }
    }

    /**
     * Cancel current parsing operation
     */
    cancel(): void {
        if (this.worker && this.currentRequestId) {
            const request: WorkerRequest = {
                type: 'cancel',
                id: this.currentRequestId
            }
            this.worker.postMessage(request)
            this.currentRequestId = null
        }
    }

    /**
     * Terminate the worker
     */
    terminate(): void {
        if (this.worker) {
            this.worker.terminate()
            this.worker = null
            this.currentRequestId = null
        }
    }

    /**
     * Read file content as string
     */
    private readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsText(file, 'UTF-8')
        })
    }

    /**
     * Generate unique request ID
     */
    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }

    /**
     * Fallback to synchronous parsing
     */
    private async fallbackToSync(
        file: File,
        customRules: CategoryMappingRule[]
    ): Promise<BankFileParseResult> {
        // Dynamically import the sync parser to avoid circular dependencies
        const { parseBankFile } = await import('./bank-file-parser')
        return parseBankFile(file, customRules)
    }
}

/**
 * Convenience function to parse a file with worker
 */
export async function parseBankFileWithWorker(
    file: File,
    customRules: CategoryMappingRule[] = [],
    options: WorkerManagerOptions = {}
): Promise<BankFileParseResult> {
    const manager = new BankFileParserWorkerManager(options)
    try {
        const result = await manager.parse(file, customRules)
        manager.terminate()
        return result
    } catch (error) {
        manager.terminate()
        throw error
    }
}
