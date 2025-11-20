import * as pdfjsLib from 'pdfjs-dist';
import type { ParseResult, Transaction } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/libs/pdf.worker.min.js';

/**
 * Extract text content from PDF file
 */
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Extract text from all pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Parse date in various formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
 */
function parseDate(dateStr: string): Date | null {
  // Remove extra spaces and normalize
  const normalized = dateStr.trim();
  
  // Try DD/MM/YYYY format
  const ddmmyyyyMatch = normalized.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try YYYY-MM-DD format
  const yyyymmddMatch = normalized.match(/(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * Parse monetary value from string
 */
function parseAmount(amountStr: string): number {
  // Remove currency symbols, spaces, and convert comma to dot
  const normalized = amountStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')  // Remove thousands separator
    .replace(',', '.');   // Convert decimal separator
  
  const amount = parseFloat(normalized);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Try to extract transactions from common Brazilian bank PDF formats
 * This is a basic implementation that looks for patterns in the text
 */
function parseTransactionsFromText(text: string): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');
  
  // Common patterns for Brazilian bank statements
  // Format: DATE DESCRIPTION AMOUNT
  // Example: 15/01/2024 COMPRA MERCADO 150,00
  const transactionPattern = /(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})\s+(.+?)\s+([\d.,-]+)/g;
  
  for (const line of lines) {
    const matches = line.matchAll(transactionPattern);
    
    for (const match of matches) {
      const [, dateStr, description, amountStr] = match;
      
      const date = parseDate(dateStr);
      if (!date) continue;
      
      const amount = parseAmount(amountStr);
      if (amount === 0) continue;
      
      // Determine if it's debit or credit based on common keywords or negative sign
      const isDebit = amountStr.includes('-') || 
                      description.toLowerCase().includes('debito') ||
                      description.toLowerCase().includes('pagamento') ||
                      description.toLowerCase().includes('compra');
      
      transactions.push({
        date: date,
        description: description.trim(),
        amount: Math.abs(amount),
        type: isDebit ? 'debit' : 'credit'
      });
    }
  }
  
  return transactions;
}

/**
 * Parse PDF bank statement
 */
export async function parsePDF(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Extract text from PDF
    const text = await extractTextFromPDF(arrayBuffer);
    
    if (!text || text.trim().length === 0) {
      throw new Error('Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem.');
    }
    
    // Try to parse transactions from text
    const transactions = parseTransactionsFromText(text);
    
    if (transactions.length === 0) {
      errors.push(
        'Nenhuma transação encontrada no PDF. O formato pode não ser suportado ainda.'
      );
      errors.push(
        'Formatos suportados: Extratos com formato DATA DESCRIÇÃO VALOR em texto.'
      );
    }
    
    // Try to extract account info from common patterns
    let accountNumber: string | undefined;
    let bankName: string | undefined;
    
    // Look for account number patterns
    const accountMatch = text.match(/(?:conta|account|c\/c|cc)[:\s]+(\d[\d-.]+\d)/i);
    if (accountMatch) {
      accountNumber = accountMatch[1];
    }
    
    // Look for bank names
    const bankPatterns = [
      'banco do brasil', 'bradesco', 'itaú', 'itau', 'santander', 
      'caixa', 'nubank', 'inter', 'c6', 'original'
    ];
    
    for (const pattern of bankPatterns) {
      if (text.toLowerCase().includes(pattern)) {
        bankName = pattern.charAt(0).toUpperCase() + pattern.slice(1);
        break;
      }
    }
    
    return {
      transactions,
      accountInfo: {
        accountNumber,
        bankId: bankName,
        currency: 'BRL'
      },
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar PDF';
    throw new Error(`Erro ao processar PDF: ${errorMessage}`);
  }
}
