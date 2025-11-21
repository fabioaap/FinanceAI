import * as pdfjsLib from 'pdfjs-dist';
import type { Transaction, ParseResult } from '../types';
import { parseCSV } from './csvParser';

// Configurar worker para pdfjs usando arquivo em public
pdfjsLib.GlobalWorkerOptions.workerSrc = '/libs/pdf.worker.min.js';

export async function parsePDF(file: File): Promise<ParseResult> {
    const errors: string[] = [];

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (pdf.numPages === 0) {
            errors.push('PDF vazio ou não contém páginas');
            return { transactions: [], errors };
        }

        let extractedText = '';

        // Extrair texto de todas as páginas
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => {
                    if ('str' in item) {
                        return item.str;
                    }
                    return '';
                })
                .join(' ');
            extractedText += pageText + '\n';
        }

        if (!extractedText.trim()) {
            errors.push('Não foi possível extrair texto do PDF');
            return { transactions: [], errors };
        }

        // Tentar detectar formato: CSV-like (linhas com separadores) ou tabular
        const lines = extractedText.split('\n').filter(line => line.trim());

        // Verificar se parece ser CSV
        if (detectCSVFormat(lines)) {
            const csvContent = convertToCSV(lines);
            return parseCSV(csvContent);
        }

        // Verificar se parece ser extrato bancário padrão
        const transactions = parseExtractLines(lines);

        if (transactions.length === 0) {
            errors.push('Não foi possível identificar transações no PDF');
        }

        return { transactions, errors };
    } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Erro ao processar PDF');
        return { transactions: [], errors };
    }
}

function detectCSVFormat(lines: string[]): boolean {
    if (lines.length === 0) return false;

    // Verificar se as primeiras linhas têm separadores consistentes
    const firstLine = lines[0];
    const separators = [',', ';', '\t', '|'];

    for (const sep of separators) {
        if (firstLine.includes(sep)) {
            const firstLineParts = firstLine.split(sep).length;
            // Verificar se pelo menos 70% das linhas têm o mesmo número de separadores
            const consistentLines = lines.filter(
                line => Math.abs(line.split(sep).length - firstLineParts) <= 1
            ).length;

            if (consistentLines / lines.length > 0.7) {
                return true;
            }
        }
    }

    return false;
}

function convertToCSV(lines: string[]): string {
    // Detectar melhor separador
    const separators = [',', ';', '\t', '|'];
    let bestScore = 0;

    for (const sep of separators) {
        const parts = lines[0].split(sep);
        const score = parts.length * lines.filter(line => line.split(sep).length === parts.length).length;
        if (score > bestScore) {
            bestScore = score;
        }
    }

    return lines.join('\n');
}

function parseExtractLines(lines: string[]): Transaction[] {
    const transactions: Transaction[] = [];
    const datePatterns = [
        /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
        /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    ];

    for (const line of lines) {
        if (line.trim().length < 10) continue;

        // Procurar por padrão de data
        let dateMatch = null;
        let dateString = '';

        for (const pattern of datePatterns) {
            const match = line.match(pattern);
            if (match) {
                dateMatch = match;
                dateString = match[0];
                break;
            }
        }

        if (!dateMatch) continue;

        // Procurar por valor monetário
        const amountMatch = line.match(/[R$]?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/);
        if (!amountMatch) continue;

        try {
            const date = parseDateFromMatch(dateMatch);
            const amount = parseAmount(amountMatch[1]);
            const description = extractDescription(line, dateString, amountMatch[0]);

            if (date && amount !== 0 && description) {
                transactions.push({
                    date,
                    description,
                    amount,
                    type: amount > 0 ? 'credit' : 'debit',
                });
            }
        } catch {
            continue;
        }
    }

    return transactions;
}

function parseDateFromMatch(match: RegExpMatchArray): Date | null {
    const [, part1, part2, part3] = match;

    if (!part1 || !part2 || !part3) return null;

    const p1 = parseInt(part1, 10);
    const p2 = parseInt(part2, 10);
    const p3 = parseInt(part3, 10);

    let year = 0;
    let month = 0;
    let day = 0;

    // Detectar formato: DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD
    if (p3 > 31) {
        // Provavelmente ano
        year = p3;
        if (p1 > 12) {
            day = p1;
            month = p2;
        } else if (p2 > 12) {
            day = p2;
            month = p1;
        } else {
            day = p1;
            month = p2;
        }
    } else if (p1 > 31) {
        year = p1;
        month = p2;
        day = p3;
    } else {
        year = p3;
        if (p1 > 12) {
            day = p1;
            month = p2;
        } else if (p2 > 12) {
            day = p2;
            month = p1;
        } else {
            day = p1;
            month = p2;
        }
    }

    if (year < 100) year += 2000;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    return new Date(year, month - 1, day);
}

function parseAmount(amountStr: string): number {
    // Remover R$ e espaços
    let cleaned = amountStr.replace(/[R$\s]/g, '');

    // Detectar separador decimal (vírgula ou ponto)
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');

    if (hasComma && hasDot) {
        // Ambos presentes, determinar qual é decimal
        const lastCommaIndex = cleaned.lastIndexOf(',');
        const lastDotIndex = cleaned.lastIndexOf('.');

        if (lastCommaIndex > lastDotIndex) {
            // Vírgula é o separador decimal
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // Ponto é o separador decimal
            cleaned = cleaned.replace(/,/g, '');
        }
    } else if (hasComma) {
        // Apenas vírgula - pode ser separador decimal
        cleaned = cleaned.replace(',', '.');
    }

    const amount = parseFloat(cleaned);
    return Number.isNaN(amount) ? 0 : amount;
}

function extractDescription(line: string, dateStr: string, amountStr: string): string {
    let desc = line
        .replace(dateStr, '')
        .replace(amountStr, '')
        .trim();

    // Remover múltiplos espaços
    desc = desc.replace(/\s+/g, ' ').trim();

    return desc.length > 0 ? desc : 'Transação';
}
