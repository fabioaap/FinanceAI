import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BankFileUpload } from '@/components/BankFileUpload'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { ParsedTransaction, Transaction } from '@/lib/types'

interface ImportBankFileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: (transactions: Transaction[]) => void
}

export function ImportBankFileModal({ 
  open, 
  onOpenChange,
  onImportComplete 
}: ImportBankFileModalProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    imported: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleTransactionsParsed = async (transactions: ParsedTransaction[]) => {
    setIsImporting(true)
    setImportResult(null)

    let imported = 0
    let failed = 0
    const errors: string[] = []
    const convertedTransactions: Transaction[] = []

    try {
      for (const txn of transactions) {
        try {
          // Converte ParsedTransaction para Transaction
          const transaction: Transaction = {
            id: crypto.randomUUID(),
            amount: txn.amount,
            description: txn.description,
            category: txn.category || 'other',
            type: txn.type,
            date: txn.date,
            createdAt: new Date().toISOString()
          }
          
          convertedTransactions.push(transaction)
          imported++
        } catch (error) {
          failed++
          errors.push(
            `Erro ao converter "${txn.description}": ${
              error instanceof Error ? error.message : 'Erro desconhecido'
            }`
          )
        }
      }

      setImportResult({
        success: imported > 0,
        imported,
        failed,
        errors: errors.slice(0, 5) // Limita a 5 erros para não sobrecarregar a UI
      })

      // Chama callback de sucesso se alguma transação foi importada
      if (imported > 0 && onImportComplete) {
        onImportComplete(convertedTransactions)
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        failed: transactions.length,
        errors: [error instanceof Error ? error.message : 'Erro ao importar transações']
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setImportResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
          <DialogDescription>
            Faça upload do seu extrato bancário para importar transações automaticamente
          </DialogDescription>
        </DialogHeader>

        {!isImporting && !importResult && (
          <BankFileUpload 
            onTransactionsParsed={handleTransactionsParsed}
            onClose={handleClose}
          />
        )}

        {isImporting && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-sm text-gray-600">Importando transações...</p>
          </div>
        )}

        {importResult && (
          <div className="space-y-4">
            <Alert className={importResult.success ? 'border-green-500' : 'border-red-500'}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <p className="font-medium mb-2">
                  {importResult.success 
                    ? `Importação concluída com sucesso!`
                    : 'Erro ao importar transações'
                  }
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ {importResult.imported} transações importadas</li>
                  {importResult.failed > 0 && (
                    <li>✗ {importResult.failed} transações falharam</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Erros encontrados:</p>
                  <ul className="text-xs space-y-1">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                    {importResult.failed > importResult.errors.length && (
                      <li>• +{importResult.failed - importResult.errors.length} erros adicionais</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
