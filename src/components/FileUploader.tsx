import { useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseOFX } from '../parsers/ofxParser';
import { parseCSV } from '../parsers/csvParser';
import { parsePDF } from '../parsers/pdfParser';
import { readFileAsText } from '../utils/helpers';
import type { ParseResult } from '../types';

interface FileUploaderProps {
  onParsed: (result: ParseResult) => void;
}

export default function FileUploader({ onParsed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const fileExt = file.name.toLowerCase().split('.').pop();

      let result: ParseResult;

      if (fileExt === 'pdf') {
        result = await parsePDF(file);
      } else if (fileExt === 'ofx') {
        const content = await readFileAsText(file);
        result = parseOFX(content);
      } else if (fileExt === 'csv') {
        const content = await readFileAsText(file);
        result = parseCSV(content);
      } else {
        throw new Error('Formato de arquivo não suportado. Use .pdf, .ofx ou .csv');
      }

      onParsed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          
          <div className="text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
            >
              <span>Selecione um arquivo</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".pdf,.ofx,.csv"
                onChange={handleFileInput}
                disabled={isProcessing}
              />
            </label>
            <span> ou arraste e solte aqui</span>
          </div>
          
          <p className="text-xs text-gray-500">
            Arquivos PDF, OFX ou CSV até 10MB
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 text-center text-blue-600">
          Processando arquivo...
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
