import Papa from 'papaparse';
import { ParseResult, Transaction } from '../types/transaction';

export class CSVParser {
  async parse(fileContent: string): Promise<ParseResult> {
    const errors: string[] = [];
    const transactions: Transaction[] = [];

    try {
      const result = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header: string) => header.toLowerCase().trim(),
      });

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error) => {
          errors.push(`Linha ${error.row}: ${error.message}`);
        });
      }

      if (!result.data || result.data.length === 0) {
        errors.push('Arquivo CSV vazio ou inválido');
        return { transactions, errors };
      }

      // Detectar formato de colunas
      const firstRow = result.data[0] as Record<string, string>;
      const columnMapping = this.detectColumns(Object.keys(firstRow));

      if (!columnMapping.date || !columnMapping.amount || !columnMapping.description) {
        errors.push('Colunas obrigatórias não encontradas (data, valor, descrição)');
        return { transactions, errors };
      }

      result.data.forEach((row: unknown, index: number) => {
        try {
          const record = row as Record<string, string>;
          const dateStr = record[columnMapping.date];
          const amountStr = record[columnMapping.amount];
          const description = record[columnMapping.description];

          if (!dateStr || !amountStr) {
            errors.push(`Linha ${index + 2}: dados incompletos`);
            return;
          }

          const date = this.parseDate(dateStr);
          const amount = this.parseAmount(amountStr);

          // Detectar tipo de transação
          let type: 'debit' | 'credit' = 'debit';
          
          if (columnMapping.type && record[columnMapping.type]) {
            const typeValue = record[columnMapping.type].toLowerCase();
            type = typeValue.includes('credit') || typeValue.includes('crédito') || typeValue.includes('entrada') 
              ? 'credit' 
              : 'debit';
          } else if (amount < 0) {
            type = 'debit';
          } else if (amount > 0) {
            type = 'credit';
          }

          transactions.push({
            date,
            description: description || 'Sem descrição',
            amount: Math.abs(amount),
            type,
            balance: columnMapping.balance && record[columnMapping.balance] 
              ? this.parseAmount(record[columnMapping.balance]) 
              : undefined,
            category: columnMapping.category && record[columnMapping.category] 
              ? record[columnMapping.category] 
              : undefined,
          });
        } catch (err) {
          errors.push(`Linha ${index + 2}: ${err instanceof Error ? err.message : String(err)}`);
        }
      });

      return { 
        transactions, 
        errors: errors.length > 0 ? errors : undefined 
      };
    } catch (error) {
      errors.push(`Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : String(error)}`);
      return { transactions, errors };
    }
  }

  private detectColumns(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    // Possíveis nomes para cada coluna
    const datePatterns = ['data', 'date', 'dt'];
    const amountPatterns = ['valor', 'amount', 'value', 'quantia'];
    const descriptionPatterns = ['descrição', 'descricao', 'description', 'historico', 'histórico'];
    const typePatterns = ['tipo', 'type', 'natureza'];
    const balancePatterns = ['saldo', 'balance'];
    const categoryPatterns = ['categoria', 'category'];

    headers.forEach((header) => {
      const headerLower = header.toLowerCase();
      
      if (datePatterns.some(pattern => headerLower.includes(pattern))) {
        mapping.date = header;
      } else if (amountPatterns.some(pattern => headerLower.includes(pattern))) {
        mapping.amount = header;
      } else if (descriptionPatterns.some(pattern => headerLower.includes(pattern))) {
        mapping.description = header;
      } else if (typePatterns.some(pattern => headerLower.includes(pattern))) {
        mapping.type = header;
      } else if (balancePatterns.some(pattern => headerLower.includes(pattern))) {
        mapping.balance = header;
      } else if (categoryPatterns.some(pattern => headerLower.includes(pattern))) {
        mapping.category = header;
      }
    });

    return mapping;
  }

  private parseDate(dateStr: string): Date {
    // Tentar diversos formatos de data
    const formats = [
      // DD/MM/YYYY
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // DD-MM-YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // DD/MM/YY
      /^(\d{2})\/(\d{2})\/(\d{2})$/,
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (match[0].startsWith(match[1]) && match[1].length === 4) {
          // YYYY-MM-DD
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        } else if (match[3].length === 2) {
          // DD/MM/YY
          const year = parseInt(match[3]) + (parseInt(match[3]) > 50 ? 1900 : 2000);
          return new Date(year, parseInt(match[2]) - 1, parseInt(match[1]));
        } else {
          // DD/MM/YYYY ou DD-MM-YYYY
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
      }
    }

    // Fallback para Date.parse
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    throw new Error(`Formato de data inválido: ${dateStr}`);
  }

  private parseAmount(amountStr: string): number {
    // Remover símbolos de moeda e espaços
    let cleaned = amountStr.replace(/[R$\s€£¥]/g, '');
    
    // Substituir vírgula por ponto se for decimal
    if (cleaned.includes(',') && !cleaned.includes('.')) {
      cleaned = cleaned.replace(',', '.');
    } else if (cleaned.includes('.') && cleaned.includes(',')) {
      // Se tiver ambos, assumir que ponto é separador de milhar
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }

    const amount = parseFloat(cleaned);
    
    if (isNaN(amount)) {
      throw new Error(`Valor inválido: ${amountStr}`);
    }

    return amount;
  }
}
