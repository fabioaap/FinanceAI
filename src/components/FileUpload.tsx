import React, { useState } from 'react';
import { ParserFactory } from '../parsers';
import { ParseResult } from '../types/transaction';

export const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validExtensions = ['.ofx', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Formato de arquivo não suportado. Use arquivos .ofx ou .csv');
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const parseResult = await ParserFactory.parseFile(selectedFile);
      setResult(parseResult);
    } catch (error) {
      setResult({
        transactions: [],
        errors: [`Erro ao processar arquivo: ${error instanceof Error ? error.message : String(error)}`],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Importação de Extratos Bancários
        </h1>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <p className="text-lg text-gray-600 mb-2">
            Arraste um arquivo ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Formatos suportados: OFX, CSV
          </p>

          <input
            type="file"
            id="file-upload"
            accept=".ofx,.csv"
            onChange={handleChange}
            className="hidden"
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Selecionar Arquivo
          </label>
        </div>

        {selectedFile && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Arquivo selecionado:
                </p>
                <p className="text-lg text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processando...' : 'Importar'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            {result.errors && result.errors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-800 font-semibold mb-2">Erros encontrados:</h3>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.accountInfo && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-blue-800 font-semibold mb-2">Informações da Conta</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {result.accountInfo.accountId && (
                    <div>
                      <span className="text-gray-600">Conta:</span>{' '}
                      <span className="text-gray-900">{result.accountInfo.accountId}</span>
                    </div>
                  )}
                  {result.accountInfo.bankId && (
                    <div>
                      <span className="text-gray-600">Banco:</span>{' '}
                      <span className="text-gray-900">{result.accountInfo.bankId}</span>
                    </div>
                  )}
                  {result.accountInfo.startDate && (
                    <div>
                      <span className="text-gray-600">Período:</span>{' '}
                      <span className="text-gray-900">
                        {formatDate(result.accountInfo.startDate)} - {formatDate(result.accountInfo.endDate!)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.transactions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Transações Importadas ({result.transactions.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.transactions.slice(0, 50).map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === 'credit'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span
                              className={
                                transaction.type === 'credit'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {transaction.type === 'credit' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.transactions.length > 50 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Mostrando primeiras 50 transações de {result.transactions.length}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
