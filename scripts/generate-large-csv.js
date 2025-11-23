#!/usr/bin/env node

/**
 * Script to generate large CSV test files for performance testing
 * Usage: node generate-large-csv.js [lines] [output-file]
 * Example: node generate-large-csv.js 50000 test-50k.csv
 */

import { writeFileSync } from 'fs';

const lines = parseInt(process.argv[2] || '50000', 10);
const outputFile = process.argv[3] || `test-${lines}.csv`;

console.log(`Generating CSV file with ${lines} transactions...`);

const categories = [
    'Supermercado Extra',
    'Restaurante Italiano',
    'Farmácia Drogasil',
    'Posto Shell',
    'Uber',
    'Netflix',
    'Aluguel',
    'Conta de Energia',
    'Shopping Center',
    'Academia',
    'Consulta Médica',
    'Livraria',
    'Cinema',
    'iFood',
    'Amazon',
    'Transferência Bancária',
    'Salário',
    'Freelance',
    'Dividendos'
];

const csvLines = ['Data,Descrição,Valor'];

for (let i = 0; i < lines; i++) {
    const day = (i % 28) + 1;
    const month = (i % 12) + 1;
    const year = 2024;
    const date = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    
    const description = categories[i % categories.length];
    const baseAmount = Math.random() * 500 + 10;
    const amount = (Math.random() > 0.3 ? -1 : 1) * baseAmount;
    const formattedAmount = amount.toFixed(2);
    
    csvLines.push(`${date},${description} #${i},${formattedAmount}`);
    
    if ((i + 1) % 10000 === 0) {
        console.log(`  Generated ${i + 1} lines...`);
    }
}

writeFileSync(outputFile, csvLines.join('\n'), 'utf-8');

console.log(`✅ Generated ${outputFile} with ${lines} transactions`);
console.log(`   File size: ${(csvLines.join('\n').length / 1024 / 1024).toFixed(2)} MB`);
