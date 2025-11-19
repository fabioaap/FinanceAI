import Papa from 'papaparse';
import type { Transaction, ParseResult } from '../types';

export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  
  try {
    const parseResult = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach(err => errors.push(err.message));
    }

    const data = parseResult.data as Record<string, string>[];
    
    if (data.length === 0) {
      errors.push('Arquivo CSV vazio ou sem dados válidos');
      return { transactions: [], errors };
    }

    // Try to detect common CSV formats
    const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());
    
    const dateFields = ['data', 'date', 'dt_transacao', 'dt_lancamento'];
    const descriptionFields = ['descricao', 'description', 'desc', 'historico', 'memo'];
    const amountFields = ['valor', 'amount', 'vlr', 'value'];
    const typeFields = ['tipo', 'type', 'dc', 'natureza'];
    
    const dateField = headers.find(h => dateFields.includes(h));
    const descriptionField = headers.find(h => descriptionFields.includes(h));
    const amountField = headers.find(h => amountFields.includes(h));
    const typeField = headers.find(h => typeFields.includes(h));

    if (!dateField || !descriptionField || !amountField) {
      errors.push('Não foi possível identificar as colunas necessárias (data, descrição, valor)');
      return { transactions: [], errors };
    }

    const transactions: Transaction[] = data.map((row, index) => {
      try {
        const dateValue = row[Object.keys(row).find(k => k.toLowerCase().trim() === dateField)!];
        const descValue = row[Object.keys(row).find(k => k.toLowerCase().trim() === descriptionField)!];
        const amountValue = row[Object.keys(row).find(k => k.toLowerCase().trim() === amountField)!];
        const typeValue = typeField ? row[Object.keys(row).find(k => k.toLowerCase().trim() === typeField)!] : null;

        const date = parseCSVDate(dateValue);
        let amount = parseFloat(amountValue.replace(/[^\d,.-]/g, '').replace(',', '.'));
        
        if (isNaN(amount)) {
          throw new Error(`Valor inválido na linha ${index + 2}`);
        }

        let type: 'debit' | 'credit';
        if (typeValue) {
          const typeNormalized = typeValue.toLowerCase().trim();
          type = typeNormalized.startsWith('c') || typeNormalized === 'credito' ? 'credit' : 'debit';
        } else {
          type = amount < 0 ? 'debit' : 'credit';
        }

        return {
          date,
          description: descValue || 'Sem descrição',
          amount: Math.abs(amount),
          type,
        };
      } catch (err) {
        errors.push(`Erro na linha ${index + 2}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        return null;
      }
    }).filter((t): t is Transaction => t !== null);

    return { 
      transactions, 
      errors: errors.length > 0 ? errors : undefined 
    };
  } catch (error) {
    errors.push(`Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return { transactions: [], errors };
  }
}

function parseCSVDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Try various date formats
  // DD/MM/YYYY or DD-MM-YYYY
  const brazilianFormat = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  let match = dateStr.match(brazilianFormat);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  
  // YYYY-MM-DD
  const isoFormat = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
  match = dateStr.match(isoFormat);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
  
  // Try standard date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return new Date();
}
