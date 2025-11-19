import { useState } from 'react';
import FileUploader from './components/FileUploader';
import TransactionList from './components/TransactionList';
import type { ParseResult } from './types';

function App() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
  };

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

        {parseResult?.transactions && (
          <TransactionList transactions={parseResult.transactions} />
        )}
      </div>
    </div>
  );
}

export default App;
