import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { BankFileParseResult, ParsedTransaction } from '@/lib/types'
import { parseBankFile } from '@/lib/bank-file-parser'

interface BankFileUploadProps {
    onTransactionsParsed: (transactions: ParsedTransaction[]) => void
    onClose?: () => void
}

export function BankFileUpload({ onTransactionsParsed, onClose }: BankFileUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [parseResult, setParseResult] = useState<BankFileParseResult | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const acceptedFormats = '.csv,.ofx,.txt'
    const maxFileSizeMB = 10

    const handleFileSelect = useCallback((selectedFile: File) => {
        // Valida tamanho do arquivo
        if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
            setParseResult({
                success: false,
                transactions: [],
                errors: [`Arquivo muito grande. Tamanho máximo: ${maxFileSizeMB}MB`],
                fileName: selectedFile.name,
                format: 'csv',
                totalParsed: 0
            })
            return
        }

        setFile(selectedFile)
        setParseResult(null)
    }, [])

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

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            handleFileSelect(droppedFile)
        }
    }, [handleFileSelect])

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            handleFileSelect(selectedFile)
        }
    }, [handleFileSelect])

    const handleProcessFile = useCallback(async () => {
        if (!file) return

        setIsProcessing(true)
        setParseResult(null)

        try {
            const result = await parseBankFile(file)
            setParseResult(result)

            if (result.success && result.transactions.length > 0) {
                // Aguarda um momento para mostrar o resultado antes de fechar
                setTimeout(() => {
                    onTransactionsParsed(result.transactions)
                }, 1500)
            }
        } catch (error) {
            setParseResult({
                success: false,
                transactions: [],
                errors: [error instanceof Error ? error.message : 'Erro ao processar arquivo'],
                fileName: file.name,
                format: 'csv',
                totalParsed: 0
            })
        } finally {
            setIsProcessing(false)
        }
    }, [file, onTransactionsParsed])

    const handleReset = useCallback(() => {
        setFile(null)
        setParseResult(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [])

    const getFormatBadgeColor = (format: string) => {
        switch (format) {
            case 'csv': return 'bg-blue-500'
            case 'ofx': return 'bg-green-500'
            case 'txt': return 'bg-yellow-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload de Extrato Bancário
                </CardTitle>
                <CardDescription>
                    Importe transações de arquivos CSV, OFX ou TXT do seu banco
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!file && !parseResult && (
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
                            Arraste e solte seu arquivo aqui ou clique para selecionar
                        </p>
                        <p className="text-xs text-gray-500">
                            Formatos aceitos: CSV, OFX, TXT (máx. {maxFileSizeMB}MB)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={acceptedFormats}
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>
                )}

                {file && !parseResult && (
                    <div className="space-y-4">
                        <Alert>
                            <FileText className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between">
                                <span className="font-medium">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(2)} KB
                                </span>
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleProcessFile}
                                disabled={isProcessing}
                                className="flex-1"
                            >
                                {isProcessing ? 'Processando...' : 'Processar Arquivo'}
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </Button>
                        </div>

                        {isProcessing && (
                            <div className="space-y-2">
                                <Progress value={undefined} className="w-full" />
                                <p className="text-xs text-center text-gray-500">
                                    Analisando transações...
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {parseResult && (
                    <div className="space-y-4">
                        <Alert className={parseResult.success ? 'border-green-500' : 'border-red-500'}>
                            {parseResult.success ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        {parseResult.success
                                            ? `${parseResult.totalParsed} transações encontradas`
                                            : 'Erro ao processar arquivo'
                                        }
                                    </span>
                                    <Badge className={getFormatBadgeColor(parseResult.format)}>
                                        {parseResult.format.toUpperCase()}
                                    </Badge>
                                </div>
                            </AlertDescription>
                        </Alert>

                        {parseResult.errors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <p className="font-medium mb-2">Erros encontrados:</p>
                                    <ul className="text-xs space-y-1">
                                        {parseResult.errors.map((error, idx) => (
                                            <li key={idx}>• {error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {parseResult.success && parseResult.transactions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Prévia das transações:</p>
                                <ScrollArea className="h-64 rounded-md border p-4">
                                    <div className="space-y-2">
                                        {parseResult.transactions.slice(0, 10).map((txn, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {txn.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(txn.date).toLocaleDateString('pt-BR')} • {txn.category}
                                                    </p>
                                                </div>
                                                <Badge variant={txn.type === 'income' ? 'default' : 'secondary'}>
                                                    {txn.type === 'income' ? '+' : '-'}
                                                    R$ {txn.amount.toFixed(2)}
                                                </Badge>
                                            </div>
                                        ))}
                                        {parseResult.transactions.length > 10 && (
                                            <p className="text-xs text-center text-gray-500 pt-2">
                                                +{parseResult.transactions.length - 10} transações adicionais
                                            </p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {parseResult.success && parseResult.transactions.length > 0 && (
                                <Button
                                    onClick={() => onTransactionsParsed(parseResult.transactions)}
                                    className="flex-1"
                                >
                                    Importar Transações
                                </Button>
                            )}
                            <Button
                                onClick={handleReset}
                                variant="outline"
                            >
                                {parseResult.success ? 'Novo Upload' : 'Tentar Novamente'}
                            </Button>
                            {onClose && (
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                >
                                    Fechar
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
