import { useState } from 'react';
import FileUploader from './components/FileUploader';
import TransactionList from './components/TransactionList';
import { useTransactions } from './hooks';
import type { ParseResult, Transaction } from './types';

function App() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { transactions: dbTransactions, addTransaction } = useTransactions();

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
    setSaveMessage(null);
  };

  const handleSaveToDatabase = async () => {
    if (!parseResult?.transactions || parseResult.transactions.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Save each transaction to the database
      for (const transaction of parseResult.transactions) {
        await addTransaction({
          date: transaction.date.toISOString(),
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          balance: transaction.balance,
        });
      }

      setSaveMessage({
        type: 'success',
        text: `${parseResult.transactions.length} transação${parseResult.transactions.length !== 1 ? 'ões' : ''} salva${parseResult.transactions.length !== 1 ? 's' : ''} com sucesso!`,
      });

      // Clear the parse result after saving
      setParseResult(null);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao salvar transações',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Display all transactions from database if no parse result
  const displayTransactions: Transaction[] = parseResult?.transactions || 
    dbTransactions.map(t => ({
      date: new Date(t.date),
      description: t.description,
      amount: t.amount,
      type: t.type,
      balance: t.balance,
    }));

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Finance AI
          </h1>
          <p className="text-lg text-gray-600">
            Importação de Extratos Bancários
          </p>
        </div>

        <FileUploader onParsed={handleParsed} />

        {saveMessage && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className={`${
              saveMessage.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            } border rounded-md p-4`}>
              <p className={`text-sm font-medium ${
                saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveMessage.text}
              </p>
            </div>
          </div>
        )}

        {parseResult?.errors && parseResult.errors.length > 0 && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Avisos ao processar arquivo:
              </h3>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {parseResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {parseResult?.accountInfo && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Informações da Conta:
              </h3>
              <div className="text-sm text-blue-700">
                {parseResult.accountInfo.bankId && (
                  <p>Banco: {parseResult.accountInfo.bankId}</p>
                )}
                {parseResult.accountInfo.accountNumber && (
                  <p>Conta: {parseResult.accountInfo.accountNumber}</p>
                )}
                {parseResult.accountInfo.currency && (
                  <p>Moeda: {parseResult.accountInfo.currency}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {parseResult?.transactions && parseResult.transactions.length > 0 && (
          <div className="mt-6 max-w-2xl mx-auto flex justify-center">
            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className={`px-6 py-2 rounded-md font-medium text-white ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isSaving ? 'Salvando...' : 'Salvar Transações no Banco de Dados'}
            </button>
          </div>
        )}

        {displayTransactions.length > 0 && (
          <TransactionList transactions={displayTransactions} />
        )}

        {!parseResult && dbTransactions.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Exibindo {dbTransactions.length} transação{dbTransactions.length !== 1 ? 'ões' : ''} do banco de dados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
