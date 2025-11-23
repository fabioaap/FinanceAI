import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { BankFileParseResult, ParsedTransaction } from '@/lib/types'
import { parseBankFile, type CategoryMappingRule } from '@/lib/bank-file-parser'
import { BankFileParserWorkerManager } from '@/lib/bank-file-parser-worker-manager'

interface FileWithResult {
    file: File
    id: string
    status: 'pending' | 'processing' | 'success' | 'error'
    result?: BankFileParseResult
    progress: number
}

interface BankFileUploadProps {
    onTransactionsParsed: (transactions: ParsedTransaction[]) => void
    onClose?: () => void
    customRules?: CategoryMappingRule[]
    allowMultiple?: boolean
}

export function BankFileUpload({
    onTransactionsParsed,
    onClose,
    customRules = [],
    allowMultiple = true
}: BankFileUploadProps) {
    const [files, setFiles] = useState<FileWithResult[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const acceptedFormats = '.csv,.ofx,.qif,.txt'
    const maxFileSizeMB = 10

    const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
        const fileArray = Array.from(selectedFiles)

        const newFiles: FileWithResult[] = fileArray.map(file => {
            // Valida tamanho
            if (file.size > maxFileSizeMB * 1024 * 1024) {
                return {
                    file,
                    id: crypto.randomUUID(),
                    status: 'error' as const,
                    progress: 0,
                    result: {
                        success: false,
                        transactions: [],
                        errors: [`Arquivo muito grande. Tamanho máximo: ${maxFileSizeMB}MB`],
                        fileName: file.name,
                        format: 'csv' as const,
                        totalParsed: 0
                    }
                }
            }

            return {
                file,
                id: crypto.randomUUID(),
                status: 'pending' as const,
                progress: 0
            }
        })

        if (allowMultiple) {
            setFiles(prev => [...prev, ...newFiles])
        } else {
            setFiles(newFiles.slice(0, 1))
        }
    }, [allowMultiple])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFiles = e.dataTransfer.files
        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles)
        }
    }, [handleFileSelect])

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileSelect(selectedFiles)
        }
    }, [handleFileSelect])

    const handleRemoveFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId))
    }, [])

    const processFile = async (fileWithResult: FileWithResult): Promise<FileWithResult> => {
        try {
            // Use worker for better performance with large files
            const manager = new BankFileParserWorkerManager({
                onProgress: (progress, message, processedLines, totalLines) => {
                    // Update progress in real-time
                    setFiles(prev => prev.map(f =>
                        f.id === fileWithResult.id
                            ? { ...f, status: 'processing' as const, progress: Math.round(progress) }
                            : f
                    ))
                }
            })

            const result = await manager.parse(fileWithResult.file, customRules)
            manager.terminate()

            return {
                ...fileWithResult,
                status: result.success ? 'success' : 'error',
                result,
                progress: 100
            }
        } catch (error) {
            return {
                ...fileWithResult,
                status: 'error',
                progress: 100,
                result: {
                    success: false,
                    transactions: [],
                    errors: [error instanceof Error ? error.message : 'Erro ao processar arquivo'],
                    fileName: fileWithResult.file.name,
                    format: 'csv',
                    totalParsed: 0
                }
            }
        }
    }

    const handleProcessFiles = useCallback(async () => {
        if (files.length === 0) return

        setIsProcessing(true)

        // Processa todos os arquivos em paralelo
        const promises = files
            .filter(f => f.status === 'pending')
            .map(f => processFile(f))

        const results = await Promise.all(promises)

        // Atualiza estado com resultados
        setFiles(prev => {
            const updatedMap = new Map(results.map(r => [r.id, r]))
            return prev.map(f => updatedMap.get(f.id) || f)
        })

        setIsProcessing(false)

        // Coleta todas as transações bem-sucedidas
        const allTransactions = results
            .filter(r => r.result?.success)
            .flatMap(r => r.result?.transactions || [])

        if (allTransactions.length > 0) {
            setTimeout(() => {
                onTransactionsParsed(allTransactions)
            }, 1000)
        }
    }, [files, customRules, onTransactionsParsed])

    const handleReset = useCallback(() => {
        setFiles([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [])

    const getStatusIcon = (status: FileWithResult['status']) => {
        switch (status) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            case 'processing': return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            default: return <AlertCircle className="h-4 w-4 text-gray-400" />
        }
    }

    const getFormatBadgeColor = (format: string) => {
        switch (format) {
            case 'csv': return 'bg-blue-500'
            case 'ofx': return 'bg-green-500'
            case 'qif': return 'bg-purple-500'
            case 'txt': return 'bg-yellow-500'
            default: return 'bg-gray-500'
        }
    }

    const totalFiles = files.length
    const pendingFiles = files.filter(f => f.status === 'pending').length
    const processingFiles = files.filter(f => f.status === 'processing').length
    const successFiles = files.filter(f => f.status === 'success').length
    const errorFiles = files.filter(f => f.status === 'error').length
    const overallProgress = totalFiles > 0
        ? Math.round((files.reduce((sum, f) => sum + f.progress, 0) / totalFiles))
        : 0

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload de Extrato Bancário
                </CardTitle>
                <CardDescription>
                    {allowMultiple
                        ? 'Importe transações de múltiplos arquivos CSV, OFX, QIF ou TXT'
                        : 'Importe transações de arquivo CSV, OFX, QIF ou TXT'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Area */}
                {(files.length === 0 || allowMultiple) && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                            ${isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-primary/50'
                            }
                        `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                            {files.length === 0
                                ? 'Arraste e solte arquivos aqui ou clique para selecionar'
                                : 'Adicionar mais arquivos'
                            }
                        </p>
                        <p className="text-xs text-gray-500">
                            Formatos aceitos: CSV, OFX, QIF, TXT (máx. {maxFileSizeMB}MB cada)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={acceptedFormats}
                            multiple={allowMultiple}
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Files List */}
                {files.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                Arquivos ({totalFiles})
                            </h3>
                            {totalFiles > 0 && (
                                <Button
                                    onClick={handleReset}
                                    variant="ghost"
                                    size="sm"
                                    disabled={isProcessing}
                                >
                                    Limpar tudo
                                </Button>
                            )}
                        </div>

                        <ScrollArea className="max-h-[300px] pr-4">
                            <div className="space-y-2">
                                {files.map((fileWithResult) => (
                                    <div
                                        key={fileWithResult.id}
                                        className="border rounded-lg p-3 space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {getStatusIcon(fileWithResult.status)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {fileWithResult.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(fileWithResult.file.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            {fileWithResult.status === 'pending' && !isProcessing && (
                                                <Button
                                                    onClick={() => handleRemoveFile(fileWithResult.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {fileWithResult.status !== 'pending' && (
                                            <Progress value={fileWithResult.progress} className="h-1" />
                                        )}

                                        {fileWithResult.result && (
                                            <div className="text-xs space-y-1">
                                                {fileWithResult.result.success ? (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <Badge variant="outline" className={getFormatBadgeColor(fileWithResult.result.format)}>
                                                            {fileWithResult.result.format.toUpperCase()}
                                                        </Badge>
                                                        <span>{fileWithResult.result.totalParsed} transações</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-red-600">
                                                        {fileWithResult.result.errors[0]}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Overall Progress */}
                        {isProcessing && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Processando arquivos...</span>
                                    <span className="font-medium">{overallProgress}%</span>
                                </div>
                                <Progress value={overallProgress} className="h-2" />
                            </div>
                        )}

                        {/* Summary */}
                        {!isProcessing && totalFiles > 0 && (processingFiles === 0) && (
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                {successFiles > 0 && (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        {successFiles} sucesso
                                    </span>
                                )}
                                {errorFiles > 0 && (
                                    <span className="flex items-center gap-1">
                                        <XCircle className="h-3 w-3 text-red-500" />
                                        {errorFiles} erro(s)
                                    </span>
                                )}
                                {pendingFiles > 0 && (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 text-gray-400" />
                                        {pendingFiles} pendente(s)
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {pendingFiles > 0 && !isProcessing && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleProcessFiles}
                                    className="flex-1"
                                >
                                    Processar {pendingFiles} arquivo{pendingFiles > 1 ? 's' : ''}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
